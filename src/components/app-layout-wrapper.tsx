import React, { useState } from "react";
import { AppNav } from "@/components/app-nav";
import { AppHeader } from "@/components/app-header";
import { TransactionModal, type TransactionData } from "@/components/transaction-modal";

interface AppLayoutWrapperProps {
  children: (props: {
    openAddModal: () => void;
    openEditModal: (t: TransactionData) => void;
    refreshKey: number;
    triggerRefresh: () => void;
  }) => React.ReactNode;
  pageTitle?: string;
}

export function AppLayoutWrapper({ children, pageTitle }: AppLayoutWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TransactionData) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppNav onOpenAddModal={handleOpenAdd} />

      <div className="flex-1 flex flex-col min-w-0 pb-32 md:pb-8">
        <AppHeader onOpenAddModal={handleOpenAdd} title={pageTitle} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children({
            openAddModal: handleOpenAdd,
            openEditModal: handleOpenEdit,
            refreshKey,
            triggerRefresh,
          })}
        </main>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={triggerRefresh}
        initialData={editingTransaction}
      />
    </div>
  );
}
