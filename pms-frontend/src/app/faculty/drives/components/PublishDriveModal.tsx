// components/PublishDriveModal.jsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface publishDriveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublishDrive: () => void;
}

export default function PublishDriveModal({
  isOpen,
  onClose,
  onPublishDrive
}: publishDriveModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Publish Drive</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to publish this drive? Once published, it will be visible to all users.</p>
          <p>Please ensure all details are correct before publishing.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={onPublishDrive}>
            Publish
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}