
import React, { useState, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
// FIX: Import RTK Query hooks for data fetching and mutations.
import {
  useGetAssignmentsQuery,
  useGetMonitorStatsQuery,
  useGetSubmissionsForAssignmentQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useDeleteAssignmentsMutation,
  useSendDeadlineReminderMutation,
  useEmailAndPurgeAssignmentMutation,
  useDownloadAssignmentAttachmentMutation,
  useDownloadSubmissionMutation,
} from '../../services/api';
import { downloadFile } from '../../utils/helpers';
import type { Assignment, Submission } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { 
  PlusIcon, TrashIcon, PencilIcon, BellIcon, ClipboardDocumentListIcon, 
  DocumentArrowUpIcon, ClockIcon, FireIcon, ArrowDownTrayIcon, PaperClipIcon
} from '../../components/icons/Icons';
import ListSkeleton from '../../components/ListSkeleton';
import TableSkeleton from '../../components/TableSkeleton';
import StatCard from '../../components/StatCard';

const AssignmentDetailModal: React.FC<{
  assignment: Assignment;
  onClose: () => void;
}> = ({ assignment, onClose }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [isPurging, setIsPurging] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [emailForPurge, setEmailForPurge] = useState(user?.email || '');
  const [assignmentToPurge, setAssignmentToPurge] = useState<Assignment | null>(null);

  // FIX: Fetch submissions using RTK Query hook.
  const { data: submissions = [], isLoading: submissionsLoading } = useGetSubmissionsForAssignmentQuery(assignment.id);
  
  // FIX: Use mutation hooks.
  const [sendReminder] = useSendDeadlineReminderMutation();
  const [emailAndPurge] = useEmailAndPurgeAssignmentMutation();
  const [downloadAttachment] = useDownloadAssignmentAttachmentMutation();
  const [downloadSubmission] = useDownloadSubmissionMutation();

  const handleSendReminder = async (assignmentId: string) => {
    try {
      const response = await sendReminder(assignmentId).unwrap();
      addNotification(response.message, 'success');
    } catch(err) {
      addNotification((err as Error).message, 'error');
    }
  };

  const openPurgeModal = (assignment: Assignment) => {
    setAssignmentToPurge(assignment);
    setEmailForPurge(user?.email || '');
    setIsPurgeModalOpen(true);
  };

  const handleEmailAndPurge = async () => {
    if (!assignmentToPurge || !emailForPurge) return;
    if (!/\S+@\S+\.\S+/.test(emailForPurge)) {
      addNotification('Please enter a valid email address.', 'error');
      return;
    }
    setIsPurging(true);
    try {
      const response = await emailAndPurge({ assignmentId: assignmentToPurge.id, email: emailForPurge }).unwrap();
      addNotification(response.message, 'success');
      setIsPurgeModalOpen(false);
      onClose(); // Close detail modal after purge
    } catch(err) {
      addNotification((err as Error).message, 'error');
    } finally {
      setIsPurging(false);
      setEmailForPurge('');
      setAssignmentToPurge(null);
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

  const handleDownloadSubmission = async (submission: Submission) => {
    try {
      const blob = await downloadSubmission(submission.id).unwrap();
      downloadFile(blob, submission.filename);
    } catch(err) {
      addNotification((err as Error).message, 'error');
    }
  };

  return (
    <>
      <Modal isOpen={!!assignment} onClose={onClose} title="Assignment Details" size="4xl">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">{assignment.title}</h2>
              <p className="text-sm text-muted-foreground">Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button onClick={() => handleSendReminder(assignment.id)} className="inline-flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white h-10 px-4 py-2 rounded-md text-sm font-medium" title="Send Deadline Reminder">
                  <BellIcon className="w-5 h-5"/>
                  <span className="hidden sm:inline">Send Reminder</span>
              </button>
              <button 
                onClick={() => openPurgeModal(assignment)} 
                disabled={isPurging}
                className="inline-flex items-center justify-center space-x-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50" 
                title="Email all submissions and permanently delete this assignment."
              >
                  <FireIcon className="w-5 h-5"/>
                  <span className="hidden sm:inline">{isPurging ? 'Processing...' : 'Email & Purge'}</span>
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Description</h3>
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: assignment.description }} />
          </div>

          {assignment.attachmentFilename && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Attachment</h3>
              <button 
                onClick={() => handleDownloadAttachment(assignment)}
                className="inline-flex items-center space-x-2 text-sm text-primary hover:underline"
              >
                <PaperClipIcon className="w-4 h-4" />
                <span>{assignment.attachmentFilename}</span>
              </button>
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold my-4 text-card-foreground">Submissions ({submissions.length})</h3>
            {submissionsLoading ? <TableSkeleton cols={4} /> : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full">
                  <thead className="bg-muted/50">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Filename</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Submitted At</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {submissions.length > 0 ? submissions.map(sub => (
                    <tr key={sub.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle text-foreground">{sub.studentName}</td>
                      <td className="p-4 align-middle text-muted-foreground">{sub.filename}</td>
                      <td className="p-4 align-middle text-muted-foreground">{new Date(sub.uploadedAt).toLocaleString()}</td>
                      <td className="p-4 align-middle">
                        <button onClick={() => handleDownloadSubmission(sub)} className="inline-flex items-center space-x-2 text-primary hover:underline text-sm">
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </td>
                    </tr>
                  )) : (
                      <tr><td colSpan={4} className="text-center p-4 text-muted-foreground">No submissions yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmationModal 
        isOpen={isPurgeModalOpen} 
        onClose={() => setIsPurgeModalOpen(false)} 
        onConfirm={handleEmailAndPurge}
        title={`Email & Purge "${assignmentToPurge?.title}"?`}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground font-bold text-destructive">
            Warning: This action is irreversible. It will email a ZIP archive of all submissions and then permanently delete this assignment and all its submission data.
          </p>
          <div>
            <label htmlFor="purge-email" className="block text-sm font-medium leading-6 text-muted-foreground">Recipient Email for ZIP Archive</label>
            <input id="purge-email" type="email" placeholder="recipient@example.com" value={emailForPurge} onChange={e => setEmailForPurge(e.target.value)} className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
          </div>
        </div>
      </ConfirmationModal>
    </>
  );
};

function MonitorDashboard(): React.ReactElement {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({});
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const [selectedAssignmentForDetail, setSelectedAssignmentForDetail] = useState<Assignment | null>(null);
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false);

  // FIX: Use RTK Query hooks for data fetching.
  const { data: assignments = [], isLoading: assignmentsLoading, error: assignmentsError } = useGetAssignmentsQuery();
  const { data: stats, isLoading: statsLoading } = useGetMonitorStatsQuery();

  // FIX: Use RTK Query mutation hooks.
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [deleteAssignments] = useDeleteAssignmentsMutation();
  const isSaving = isCreating || isUpdating;


  const handleSelectAssignmentForDetail = (assignment: Assignment) => {
    setSelectedAssignmentForDetail(assignment);
  };

  const openModalForCreate = () => {
    setCurrentAssignment({});
    setAttachmentFile(null);
    setIsCreateEditModalOpen(true);
  };

  const openModalForEdit = (assignment: Assignment) => {
    setCurrentAssignment({ ...assignment, deadline: assignment.deadline.slice(0, 16) });
    setAttachmentFile(null);
    setIsCreateEditModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!user || !currentAssignment.title || !currentAssignment.description || !currentAssignment.deadline) {
        addNotification('Title, description, and deadline are required.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', currentAssignment.title);
    formData.append('description', currentAssignment.description);
    formData.append('deadline', new Date(currentAssignment.deadline).toISOString());
    if (attachmentFile) {
        formData.append('attachment', attachmentFile);
    }

    try {
      const isUpdating = !!currentAssignment.id;
      if (isUpdating) {
        await updateAssignment({ id: currentAssignment.id!, formData }).unwrap();
      } else {
        await createAssignment(formData).unwrap();
      }
      addNotification(`Assignment ${isUpdating ? 'updated' : 'created'} successfully`, 'success');
      setIsCreateEditModalOpen(false);
    } catch (err) {
      addNotification((err as Error).message, 'error');
    }
  };

  const openConfirmDeleteModal = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    try {
      await deleteAssignment(assignmentToDelete.id).unwrap();
      addNotification('Assignment deleted successfully', 'success');
      if(selectedAssignmentForDetail?.id === assignmentToDelete.id){
          setSelectedAssignmentForDetail(null);
      }
    } catch (err) {
      addNotification((err as Error).message, 'error');
    } finally {
      setIsConfirmDeleteOpen(false);
      setAssignmentToDelete(null);
    }
  };

  const handleToggleSelectAll = () => {
    setSelectedIds(prevSelectedIds => {
        if (prevSelectedIds.size === assignments.length) {
            return new Set();
        } else {
            return new Set(assignments.map(a => a.id));
        }
    });
  };

  const handleToggleSelect = (assignmentId: string) => {
    setSelectedIds(prevSelectedIds => {
        const newSelectedIds = new Set(prevSelectedIds);
        if (newSelectedIds.has(assignmentId)) {
            newSelectedIds.delete(assignmentId);
        } else {
            newSelectedIds.add(assignmentId);
        }
        return newSelectedIds;
    });
  };

  const handleBulkDelete = async () => {
    const idsToDelete = [...selectedIds];
    if (idsToDelete.length === 0) return;
    try {
        await deleteAssignments(idsToDelete).unwrap();
        addNotification(`${idsToDelete.length} assignments deleted successfully`, 'success');
        if (selectedAssignmentForDetail && selectedIds.has(selectedAssignmentForDetail.id)) {
            setSelectedAssignmentForDetail(null);
        }
        setSelectedIds(new Set());
    } catch (err) {
        addNotification((err as Error).message, 'error');
    } finally {
        setIsConfirmBulkDeleteOpen(false);
    }
  };
  
  const StatSkeleton = () => <div className="bg-card border rounded-lg p-5 shadow-sm animate-pulse h-[108px]"></div>;

  const editorModules = useMemo(() => ({
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link'], ['clean']
    ],
  }), []);

  const loading = assignmentsLoading || statsLoading;
  const error = assignmentsError ? (assignmentsError as any).message : '';

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Monitor Dashboard</h1>
           {selectedIds.size > 0 ? (
            <button 
                onClick={() => setIsConfirmBulkDeleteOpen(true)} 
                className="inline-flex items-center justify-center space-x-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 rounded-md text-sm font-medium"
            >
                <TrashIcon className="w-5 h-5"/>
                <span>Delete Selected ({selectedIds.size})</span>
            </button>
        ) : (
            <button onClick={openModalForCreate} className="inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium">
                <PlusIcon className="w-5 h-5"/>
                <span>Create Assignment</span>
            </button>
        )}
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Overview</h2>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading || !stats ? (
              <><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
            ) : (
              <>
                <StatCard icon={<ClipboardDocumentListIcon className="w-6 h-6"/>} title="Assignments Created" value={stats.assignmentsCreated} />
                <StatCard icon={<DocumentArrowUpIcon className="w-6 h-6"/>} title="Total Submissions" value={stats.totalSubmissions} />
                <StatCard icon={<ClockIcon className="w-6 h-6"/>} title="Pending Assignments" value={stats.pendingAssignments} description="Deadline not passed" />
              </>
            )}
          </div>
        </section>

        <div className="bg-card border rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-semibold text-card-foreground">All Assignments</h2>
                {assignments.length > 0 && (
                     <div className="flex items-center space-x-2">
                        <label htmlFor="select-all" className="text-sm text-muted-foreground">Select All</label>
                        <input
                            type="checkbox"
                            id="select-all"
                            checked={assignments.length > 0 && selectedIds.size === assignments.length}
                            onChange={handleToggleSelectAll}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            aria-label="Select all assignments"
                        />
                    </div>
                )}
            </div>
            {assignmentsLoading ? <ListSkeleton items={5} /> : error ? <p className="text-destructive">{error}</p> : (
              <ul className="space-y-2">
                {assignments.map(assign => (
                   <li key={assign.id} className={`rounded-md transition-colors duration-200 flex items-start space-x-4 p-3 group ${selectedIds.has(assign.id) ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                     <input
                        type="checkbox"
                        checked={selectedIds.has(assign.id)}
                        onChange={() => handleToggleSelect(assign.id)}
                        className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary shrink-0"
                        aria-labelledby={`assignment-title-${assign.id}`}
                     />
                     <div onClick={() => handleSelectAssignmentForDetail(assign)} className="flex-grow cursor-pointer">
                         <div className="flex justify-between items-start">
                           <div>
                               <h3 id={`assignment-title-${assign.id}`} className="font-semibold">{assign.title}</h3>
                               <p className="text-xs text-muted-foreground">Deadline: {new Date(assign.deadline).toLocaleDateString()}</p>
                           </div>
                           <div className="flex space-x-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <button aria-label="Edit assignment" onClick={(e) => { e.stopPropagation(); openModalForEdit(assign); }} className="text-yellow-400 hover:text-yellow-300 p-1"><PencilIcon className="w-4 h-4"/></button>
                               <button aria-label="Delete assignment" onClick={(e) => { e.stopPropagation(); openConfirmDeleteModal(assign); }} className="text-destructive hover:text-destructive/80 p-1"><TrashIcon className="w-4 h-4"/></button>
                           </div>
                         </div>
                     </div>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
      
      {selectedAssignmentForDetail && (
        <AssignmentDetailModal
          assignment={selectedAssignmentForDetail}
          onClose={() => setSelectedAssignmentForDetail(null)}
        />
      )}
      
      <Modal isOpen={isCreateEditModalOpen} onClose={() => setIsCreateEditModalOpen(false)} title={currentAssignment.id ? 'Edit Assignment' : 'Create Assignment'} size="xl">
        <div className="space-y-4">
          <input type="text" placeholder="Title" value={currentAssignment.title || ''} onChange={e => setCurrentAssignment({ ...currentAssignment, title: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
          <ReactQuill
              theme="snow"
              value={currentAssignment.description || ''}
              onChange={(content) => setCurrentAssignment({ ...currentAssignment, description: content })}
              modules={editorModules}
          />
          <input type="datetime-local" value={currentAssignment.deadline || ''} onChange={e => setCurrentAssignment({ ...currentAssignment, deadline: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
          <div>
            <label className="block text-sm font-medium leading-6 text-muted-foreground">Attachment (Optional)</label>
            <input 
              type="file"
              onChange={(e) => setAttachmentFile(e.target.files ? e.target.files[0] : null)}
              className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {attachmentFile && <span className="text-xs text-muted-foreground mt-1">Selected: {attachmentFile.name}</span>}
            {currentAssignment.id && currentAssignment.attachmentFilename && !attachmentFile && (
              <div className="text-xs text-muted-foreground mt-1">
                Current attachment: {currentAssignment.attachmentFilename}. <span className="font-semibold">Uploading a new file will replace it.</span>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button onClick={() => setIsCreateEditModalOpen(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">Cancel</button>
            <button onClick={handleSaveAssignment} disabled={isSaving} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteAssignment}
        title="Delete Assignment"
        message={`Are you sure you want to delete the assignment "${assignmentToDelete?.title}"? This action cannot be undone.`}
      />
      <ConfirmationModal
        isOpen={isConfirmBulkDeleteOpen}
        onClose={() => setIsConfirmBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.size} Assignments`}
        message={`Are you sure you want to permanently delete these ${selectedIds.size} assignments and all their submissions? This action cannot be undone.`}
      />
    </>
  );
}

export default MonitorDashboard;
