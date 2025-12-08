"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CategoryForm from "@/components/forms/category-form";

type AddCategoryDialogProps = {
  categories: any[];
};

export default function AddCategoryDialog({ categories }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="add-category-button">+ Add Category</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" data-testid="add-category-dialog">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <CategoryForm categories={categories} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}