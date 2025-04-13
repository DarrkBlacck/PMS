import { Drive, Company, Job, Requirement } from './types';
import { Modal, Button, Tabs, Tab, Card, CardBody, Chip, ModalHeader, ModalBody, ModalFooter, Accordion, AccordionItem } from '@heroui/react';
import { format } from 'date-fns';
import { useStudentManagement } from './useStudentManagement';
import { useState } from 'react';
import { IoLocationOutline, IoCalendarOutline, IoCashOutline, IoBusinessOutline, IoTimeOutline } from 'react-icons/io5';

interface DriveDetailsProps {
  drive: Drive;
  jobs: Job[];
}

export function DriveDetails({ 
  drive, 
  jobs,
}: DriveDetailsProps) {
  const { handleApplyClick, handleApplyToJob } = useStudentManagement();

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{drive.title}</h2>
        <div className="flex gap-4 text-gray-600">
          {drive.location && (
            <div className="flex items-center gap-1">
              <IoLocationOutline />
              <span>{drive.location}</span>
            </div>
          )}
          {drive.drive_date && (
            <div className="flex items-center gap-1">
              <IoCalendarOutline />
              <span>{format(new Date(drive.drive_date), 'PP')}</span>
            </div>
          )}
          {drive.form_link && (
                <div>
                  <p className="text-sm text-gray-500">Drive Application Form</p>
                  <Button
                  color="primary"
                  variant="solid"
                  size="sm"
                  onPress={() => handleApplyClick(drive.form_link!)}
                  >
                  Apply to Drive
                  </Button>
                </div>
                )}
        </div>
      </header>

      <Tabs 
        defaultSelectedKey="jobs"
        className="w-full"
        aria-label="Drive sections"
      >
        <Tab key="jobs" title="Open Positions">
          <div className="space-y-6 py-4">
            {jobs.map((job) => (
              <JobCard 
                key={job._id}
                job={job}
                company={drive.companies?.find(c => c._id === job.company)}
                driveId={drive._id}
              />
            ))}
          </div>
        </Tab>

        <Tab key="details" title="Drive Details">
          <div className="space-y-6 py-4">
            {drive.desc && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-2">About This Drive</h3>
                  <p className="text-gray-600">{drive.desc}</p>
                </CardBody>
              </Card>
            )}

            {drive.stages && drive.stages.length > 0 && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-4">Selection Process</h3>
                  <div className="flex flex-wrap gap-2">
                    {drive.stages.map((stage, index) => (
                      <div key={index} className="flex items-center">
                        <Chip
                          color="primary"
                          variant="flat"
                          startContent={<span className="font-bold">{index + 1}</span>}
                        >
                          {stage}
                        </Chip>
                        {index < drive.stages!.length - 1 && (
                          <span className="mx-2 text-gray-400">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {drive.additional_instructions && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-2">Important Instructions</h3>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    {drive.additional_instructions}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

function JobCard({ job, company, driveId }: { job: Job; company?: Company; driveId: string }) {
  const { handleApplyToJob, handleApplyClick, handleResumeFileChange, resumeFile, loading } = useStudentManagement();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardBody className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{job.title}</h3>
            <div className="flex gap-2 items-center text-gray-600">
              <IoBusinessOutline />
              <span>{company?.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {job.job_type && (
              <Chip color="primary" variant="flat" size="sm">{job.job_type}</Chip>
            )}
            {job.hasApplied && (
              <Chip color="success" variant="flat" size="sm">Applied</Chip>
            )}
          </div>
        </div>

        <Accordion>
          <AccordionItem 
            key="details" 
            title="View Job & Company Details"
            className="px-0"
          >
            <div className="space-y-4 pt-2">
              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4">
                {job.experience && (
                  <div className="flex items-center gap-2">
                    <IoTimeOutline className="text-gray-500" />
                    <span>{job.experience} years experience</span>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-2">
                    <IoCashOutline className="text-gray-500" />
                    <span>₹{job.salary_range[0]} - ₹{job.salary_range[1]} LPA</span>
                  </div>
                )}
              </div>

              {/* Requirements Section */}
              {job.requirement && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Requirements</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {job.requirement.skills_required && (
                      <div>
                        <p className="text-gray-500 mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {job.requirement.skills_required.map((skill, index) => (
                            <Chip key={index} size="sm" variant="flat" color="primary">
                              {skill}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                    {job.requirement.preferred_qualifications && (
                      <div>
                        <p className="text-gray-500 mb-2">Preferred Qualifications</p>
                        <div className="flex flex-wrap gap-1">
                          {job.requirement.preferred_qualifications.map((qual, index) => (
                            <Chip key={index} size="sm" variant="dot">
                              {qual}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Company Details */}
              {company && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">About {company.name}</h4>
                  {company.desc && <p className="text-gray-600">{company.desc}</p>}
                  <div className="flex gap-4">
                    {company.site && (
                      <Button
                        as="a"
                        href={company.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="light"
                        size="sm"
                      >
                        Visit Website
                      </Button>
                    )}
                    {company.avg_salary && (
                      <Chip color="success" variant="flat">
                        Avg. Package: ₹{company.avg_salary.toLocaleString()} LPA
                      </Chip>
                    )}
                  </div>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center gap-4 pt-2">
          {!job.form_link && (
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleResumeFileChange(e.target.files?.[0] || null)}
              className="flex-1 text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100"
            />
          )}
          <Button
            color="primary"
            size="lg"
            isDisabled={job.hasApplied || (!resumeFile && !job.form_link)}
            onPress={() => job.form_link ? handleApplyClick(job.form_link) : handleApplyToJob(job._id, driveId, company?._id!, resumeFile!)}
            isLoading={loading}
          >
            {job.hasApplied ? 'Applied' : job.form_link ? 'Apply via Form' : 'Apply Now'}
          </Button>
        </div>
      </CardBody>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        isDismissable={false} 
        isKeyboardDismissDisabled={true}
      >
        <ModalHeader>
          Confirm Form Submission
        </ModalHeader>
        <ModalBody>
          <p>Have you completed and submitted the external application form?</p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={() => setIsModalOpen(false)}
          >
            No, Not Yet
          </Button>
          <Button
            color="primary"
            onPress={async () => {
              try {
                await handleApplyToJob(job._id, driveId, company?._id!, resumeFile!);
                setIsModalOpen(false);
                setFormSubmitted(true);
              } catch (error) {
                console.error('Error confirming submission:', error);
              }
            }}
            isLoading={loading}
          >
            Yes, I Have Submitted
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
}