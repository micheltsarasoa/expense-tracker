"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AccountForm from "@/components/forms/account-form";

export default function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="add-account-button">+ Add Account</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" data-testid="add-account-dialog">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <AccountForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}