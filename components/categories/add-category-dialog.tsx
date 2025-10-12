"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CategoryForm from "@/components/forms/category-form";

type AddCategoryDialogProps = {
  categories: any[];
};

export default function AddCategoryDialog({ categories }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Category</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <CategoryForm categories={categories} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}