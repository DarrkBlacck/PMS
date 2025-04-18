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
      <h1>Job wise eligigle students, approve and publish</h1>
      </ModalContent>
    </Modal>
  );
}