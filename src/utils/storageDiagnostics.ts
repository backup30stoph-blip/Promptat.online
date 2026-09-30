import { supabase } from '../services/supabase/client';

export interface DiagnosticResult {
  success: boolean;
  bucketExists: boolean;
  readPermissions: boolean;
  writePermissions: boolean;
  userAuthenticated: boolean;
  currentUserId?: string;
  errorDetails?: string;
  remediationSteps?: string[];
  stages: {
    stage: string;
    status: 'success' | 'failure' | 'skipped';
    message: string;
  }[];
}

/**
 * Diagnostic utility function to thoroughly test Supabase Storage connectivity
 */
export async function testStorageConnectivity(bucketName: string = 'media'): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    success: false,
    bucketExists: false,
    readPermissions: false,
    writePermissions: false,
    userAuthenticated: false,
    stages: []
  };

  const remediation: string[] = [];

  try {
    // 1. Check user authentication state
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    result.userAuthenticated = !!user;
    if (user) {
      result.currentUserId = user.id;
      result.stages.push({
        stage: 'Authentication',
        status: 'success',
        message: `Authenticated as User ID: ${user.id} (${user.email})`
      });
    } else {
      result.stages.push({
        stage: 'Authentication',
        status: 'failure',
        message: 'Guest/Anonymous access. Some write buckets require admin or authenticated credentials.'
      });
      remediation.push('Sign in with an active administrative or creator account to bypass guest RLS limitations.');
    }

    // 2. Check bucket existence and read access by listing files
    result.stages.push({
      stage: 'Check Bucket & Read Access',
      status: 'success', // temporary placeholder, will update below
      message: 'Attempting to query bucket...'
    });

    const lastStageIdx = result.stages.length - 1;

    try {
      // Use list with limit 1 to see if we can query the bucket
      const { data: listData, error: listError } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 });

      if (listError) {
        throw listError;
      }

      result.bucketExists = true;
      result.readPermissions = true;
      result.stages[lastStageIdx] = {
        stage: 'Check Bucket & Read Access',
        status: 'success',
        message: `Success! Bucket '${bucketName}' exists and is readable. (Found ${listData?.length || 0} items)`
      };
    } catch (readErr: any) {
      result.stages[lastStageIdx] = {
        stage: 'Check Bucket & Read Access',
        status: 'failure',
        message: `Failed to access bucket: ${readErr.message || 'Unknown error'}`
      };

      if (readErr.message?.includes('bucket_id') || readErr.message?.includes('does not exist') || readErr.status === 404) {
        remediation.push(`Bucket '${bucketName}' may not exist in your Supabase project yet.`);
        remediation.push(`Go to your Supabase Dashboard -> Storage and create a public bucket named '${bucketName}'.`);
      } else {
        remediation.push('Verify that Row Level Security (RLS) on storage.objects allows SELECT queries for anonymous or authenticated users.');
      }
      
      result.errorDetails = readErr.message || 'Bucket read permission failed';
      return result;
    }

    // 3. Perform a dry-run write attempt to test INSERT RLS rules
    result.stages.push({
      stage: 'Write Permission (Dry-run)',
      status: 'success',
      message: 'Attempting dry-run write...'
    });
    const writeStageIdx = result.stages.length - 1;

    // We will attempt to write a small diagnostic log file in uploads folder
    const timestamp = Date.now();
    const dryRunFileName = `.diagnostics-dryrun-${timestamp}.txt`;
    const folderPath = user?.id ? `uploads/${user.id}` : 'uploads';
    const dryRunPath = `${folderPath}/${dryRunFileName}`;
    const testContent = `Dry-run storage check executed at ${new Date().toISOString()} by ${user?.email || 'Anonymous'}`;
    const fileBlob = new Blob([testContent], { type: 'text/plain' });
    const dummyFile = new File([fileBlob], dryRunFileName, { type: 'text/plain' });

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(dryRunPath, dummyFile, {
          cacheControl: '0',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      result.writePermissions = true;
      result.stages[writeStageIdx] = {
        stage: 'Write Permission (Dry-run)',
        status: 'success',
        message: `Success! Created temporary write asset at '${dryRunPath}'`
      };

      // 4. Cleanup write test
      result.stages.push({
        stage: 'Write Cleanup',
        status: 'success',
        message: 'Cleaning up dry-run asset...'
      });
      const cleanupStageIdx = result.stages.length - 1;

      try {
        const { error: removeError } = await supabase.storage
          .from(bucketName)
          .remove([dryRunPath]);

        if (removeError) throw removeError;

        result.stages[cleanupStageIdx] = {
          stage: 'Write Cleanup',
          status: 'success',
          message: 'Success! Temporary file deleted successfully.'
        };
      } catch (cleanErr: any) {
        result.stages[cleanupStageIdx] = {
          stage: 'Write Cleanup',
          status: 'failure',
          message: `Notice: Test file written, but failed to self-delete: ${cleanErr.message}`
        };
      }

      result.success = true;

    } catch (writeErr: any) {
      result.stages[writeStageIdx] = {
        stage: 'Write Permission (Dry-run)',
        status: 'failure',
        message: `Write rejected: ${writeErr.message || 'Database error'}`
      };

      if (writeErr.message?.includes('42501') || writeErr.status === 403 || writeErr.message?.includes('policy') || writeErr.message?.includes('violates row-level security')) {
        remediation.push('The bucket was found, but your user credentials do not have write (INSERT/UPDATE) permissions under current RLS policies.');
        remediation.push(`Check if the storage RLS policy requires administrative privilege to write to '${bucketName}'.`);
        remediation.push('Run the generated secure storage RLS SQL scripts to automatically grant secure folder permissions.');
      } else {
        remediation.push(`Verify write policies for bucket '${bucketName}' on the storage.objects table.`);
      }

      result.errorDetails = writeErr.message || 'Write attempt denied by RLS policies';
    }

  } catch (globalErr: any) {
    result.stages.push({
      stage: 'Global System Check',
      status: 'failure',
      message: `Fatal diagnostic failure: ${globalErr.message || 'Unexpected exception'}`
    });
    result.errorDetails = globalErr.message;
  }

  if (remediation.length > 0) {
    result.remediationSteps = remediation;
  }

  return result;
}
