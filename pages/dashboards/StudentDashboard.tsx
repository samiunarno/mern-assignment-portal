
import React, { useState, useEffect, useCallback } from 'react';
// FIX: Import RTK Query hooks for data fetching and mutations.
import {
  useGetAssignmentsQuery,
  useGetStudentSubmissionsQuery,
  useGetStudentStatsQuery,
  useSubmitAssignmentMutation,
  useDownloadAssignmentAttachmentMutation,
} from '../../services/api';
import { downloadFile } from '../../utils/helpers';
import type { Assignment, Submission } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import Countdown from '../../components/Countdown';
import { DocumentArrowUpIcon, ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, PaperClipIcon } from '../../components/icons/Icons';
import { validateStudentSubmissionFile } from '../../utils/helpers';
import AssignmentSkeleton from '../../components/AssignmentSkeleton';
import TableSkeleton from '../../components/TableSkeleton';
import StatCard from '../../components/StatCard';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  // FIX: Use RTK Query hooks for data fetching.
  const { data: assignments = [], isLoading: assignmentsLoading, error: assignmentsError } = useGetAssignmentsQuery();
  const { data: submissions = [], isLoading: submissionsLoading, error: submissionsError } = useGetStudentSubmissionsQuery();
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetStudentStatsQuery();

  // FIX: Use RTK Query mutation hooks.
  const [submitAssignment, { isLoading: isUploading }] = useSubmitAssignmentMutation();
  const [downloadAttachment] = useDownloadAssignmentAttachmentMutation();

  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [assignmentId]: e.target.files![0] }));
      setUploadErrors(prev => ({ ...prev, [assignmentId]: '' }));
    } else {
      setFiles(prev => ({ ...prev, [assignmentId]: null }));
    }
  };
  
  const handleDownloadAttachment = async (assignment: Assignment) => {
    if (!assignment.attachmentFilename) return;
    try {
      const blob = await downloadAttachment(assignment.id).unwrap();
      downloadFile(blob, assignment.attachmentFilename);
    } catch(err) {
      addNotification((err as Error).message, 'error');
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    const fileToSubmit = files[assignmentId];

    if (!fileToSubmit) {
      setUploadErrors(prev => ({ ...prev, [assignmentId]: 'Please select a file.' }));
      return;
    }

    const validationError = validateStudentSubmissionFile(fileToSubmit);
    if (validationError) {
      setUploadErrors(prev => ({ ...prev, [assignmentId]: validationError }));
      return;
    }
    
    setUploadErrors(prev => ({ ...prev, [assignmentId]: '' }));

    try {
      await submitAssignment({ assignmentId, file: fileToSubmit }).unwrap();
      addNotification('Submission successful!', 'success');
      setFiles(prev => ({ ...prev, [assignmentId]: null }));
      
      const fileInput = document.querySelector(`input[type="file"][data-assignment-id="${assignmentId}"]`) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (err) {
      setUploadErrors(prev => ({ ...prev, [assignmentId]: (err as Error).message }));
    }
  };

  const getSubmissionStatus = (assignmentId: string) => {
    return submissions.find(sub => sub.assignmentId === assignmentId);
  };
  
  const getStatusBadge = (submission: Submission | undefined, isDeadlinePassed: boolean) => {
    if (submission) {
        return (
            <span className="inline-flex items-center gap-x-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400">
                <CheckCircleIcon className="w-3 h-3" />
                Submitted
            </span>
        );
    }
    if (isDeadlinePassed) {
        return (
            <span className="inline-flex items-center gap-x-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-destructive/20 text-destructive">
                <ExclamationTriangleIcon className="w-3 h-3" />
                Deadline Missed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-x-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-500/20 text-yellow-400">
            <ClockIcon className="w-3 h-3" />
            Not Submitted
        </span>
    );
  }
  
  const StatSkeleton = () => <div className="bg-card border rounded-lg p-5 shadow-sm animate-pulse h-[108px]"></div>;

  const loading = assignmentsLoading || submissionsLoading || statsLoading;
  const error = assignmentsError || submissionsError || statsError;

  const sortedSubmissions = [...submissions].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return (
    <div className="space-y-8">
       <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
       
        <section>
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">My Progress</h2>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsLoading || !stats ? (
              <><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
            ) : (
              <>
                <StatCard icon={<ClipboardDocumentListIcon className="w-6 h-6"/>} title="Available" value={stats.assignmentsAvailable} description="Total assignments" />
                <StatCard icon={<CheckCircleIcon className="w-6 h-6"/>} title="Submitted" value={stats.assignmentsSubmitted} />
                <StatCard icon={<ClockIcon className="w-6 h-6"/>} title="Pending" value={stats.assignmentsPending} description="Awaiting submission" />
                 <div className="bg-card border rounded-lg p-5 shadow-sm flex items-start space-x-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                        <ClockIcon className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Next Deadline</p>
                        <p className="text-lg font-bold text-foreground">
                            {stats.nextDeadline ? new Date(stats.nextDeadline).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {stats.nextDeadline ? new Date(stats.nextDeadline).toLocaleTimeString() : 'No upcoming deadlines'}
                        </p>
                    </div>
                </div>
              </>
            )}
          </div>
        </section>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Assignments</h2>
        {assignmentsLoading ? (
          <div className="space-y-8">
              <AssignmentSkeleton />
              <AssignmentSkeleton />
          </div>
          ) : error ? (
              <p className="text-destructive">Error loading assignments.</p>
          ) : (
        <div className="space-y-8">
          {assignments.map(assignment => {
            const submission = getSubmissionStatus(assignment.id);
            const isDeadlinePassed = new Date(assignment.deadline) < new Date();
            const assignmentIsUploading = isUploading && (isUploading as any).originalArgs?.assignmentId === assignment.id;

            return (
              <div key={assignment.id} className="bg-card border p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                     <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                        <h2 className="text-2xl font-bold text-card-foreground">{assignment.title}</h2>
                        {getStatusBadge(submission, isDeadlinePassed)}
                    </div>
                    <div className="prose-content" dangerouslySetInnerHTML={{ __html: assignment.description }} />
                     {assignment.attachmentFilename && (
                        <div className="mt-4">
                          <button 
                            onClick={() => handleDownloadAttachment(assignment)}
                            className="inline-flex items-center space-x-2 text-sm text-primary hover:underline"
                          >
                            <PaperClipIcon className="w-4 h-4" />
                            <span>Download Attachment</span>
                          </button>
                        </div>
                    )}
                  </div>
                  <div>
                    <Countdown deadline={assignment.deadline} />
                  </div>
                </div>
                <div className="mt-6 border-t pt-6">
                  {submission ? (
                    <div className="text-center p-4 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                      <p className="font-bold">Submitted!</p>
                      <p>Filename: {submission.filename}</p>
                      <p>Date: {new Date(submission.uploadedAt).toLocaleString()}</p>
                    </div>
                  ) : isDeadlinePassed ? (
                    <div className="text-center p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                      <p className="font-bold">The deadline for this assignment has passed.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-foreground">Submit Your Assignment</h3>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input 
                          type="file" 
                          data-assignment-id={assignment.id}
                          onChange={(e) => handleFileChange(e, assignment.id)} 
                          accept=".pdf"
                          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        <button 
                          onClick={() => handleSubmit(assignment.id)}
                          disabled={assignmentIsUploading}
                          className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          <DocumentArrowUpIcon className="w-5 h-5"/>
                          <span>{assignmentIsUploading ? 'Uploading...' : 'Submit'}</span>
                        </button>
                      </div>
                      {uploadErrors[assignment.id] && <p className="text-sm text-destructive mt-2">{uploadErrors[assignment.id]}</p>}
                      <p className="text-xs text-muted-foreground">
                        File must be a .pdf and named with your Chinese name only (e.g., 王小明.pdf).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <div className="bg-card border p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Submission History</h2>
          {submissionsLoading ? (
              <TableSkeleton cols={3} />
          ) : error ? (
              <p className="text-destructive">Error loading submission history.</p>
          ) : sortedSubmissions.length > 0 ? (
              <div className="overflow-x-auto">
                  <table className="min-w-full">
                      <thead className="border-b">
                          <tr>
                              <th scope="col" className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assignment Title</th>
                              <th scope="col" className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Your Filename</th>
                              <th scope="col" className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Submitted On</th>
                          </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                          {sortedSubmissions.map((sub) => {
                              const assignment = assignments.find(a => a.id === sub.assignmentId);
                              return (
                                  <tr key={sub.id} className="border-b transition-colors hover:bg-muted/50">
                                      <td className="p-4 align-middle font-medium text-foreground">{assignment?.title || 'N/A'}</td>
                                      <td className="p-4 align-middle text-muted-foreground">{sub.filename}</td>
                                      <td className="p-4 align-middle text-muted-foreground">{new Date(sub.uploadedAt).toLocaleString()}</td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          ) : (
              <p className="text-muted-foreground">You have not made any submissions yet.</p>
          )}
      </div>
    </div>
  );
};

export default StudentDashboard;
