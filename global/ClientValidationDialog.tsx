"use client";
// ClientValidationDialog: Dialog prompting user to complete address or consent before booking
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface ClientValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingAddress?: boolean;
  missingConsent?: boolean;
}

// --- Main ClientValidationDialog component ---
const ClientValidationDialog: React.FC<ClientValidationDialogProps> = ({
  open,
  onOpenChange,
  missingAddress = false,
  missingConsent = false,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  // Handle complete profile button click
  const handleCompleteProfile = () => {
    onOpenChange(false);
    router.push('/register/client?step=2');
  };

  // Determine title and description based on what's missing
  const getTitle = () => {
    if (missingAddress && missingConsent) {
      return t('completeProfileRequired', 'Complete Profile Required');
    } else if (missingAddress) {
      return t('addressInformationRequired', 'Address Information Required');
    } else if (missingConsent) {
      return t('termsConditionsRequired', 'Terms & Conditions Required');
    }
    return t('profileIncomplete', 'Profile Incomplete');
  };

  const getDescription = () => {
    if (missingAddress && missingConsent) {
      return t('completeProfileDescription', 
        'To book a service, you need to complete your address information and accept the terms and conditions. Please complete your profile to continue.');
    } else if (missingAddress) {
      return t('addressDescription', 
        'To book a service, you need to complete your address information. Please complete your profile to continue.');
    } else if (missingConsent) {
      return t('consentDescription', 
        'To book a service, you need to accept the terms and conditions. Please complete your profile to continue.');
    }
    return t('profileIncompleteDescription', 
      'Please complete your profile to continue booking.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            <span 
              data-editable 
              data-key="bookingValidation.title" 
              className="cursor-pointer px-2 py-1 rounded transition-colors"
            >
              {getTitle()}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            <span 
              data-editable 
              data-key="bookingValidation.description" 
              className="cursor-pointer px-2 py-1 rounded transition-colors"
            >
              {getDescription()}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-6">
          <Button
            onClick={handleCompleteProfile}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            <span 
              data-editable 
              data-key="completeProfile" 
              className="cursor-pointer px-2 py-1 rounded transition-colors"
            >
              {t('completeProfile') || 'Complete Profile'}
            </span>
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-white hover:bg-gray-50 text-teal-600 border border-teal-600"
          >
            <span 
              data-editable 
              data-key="cancel" 
              className="cursor-pointer px-2 py-1 rounded transition-colors"
            >
              {t('cancel') || 'Cancel'}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientValidationDialog;

