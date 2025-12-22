import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import CustomInput from "./ui/input";
import { useLanguage } from "../contexts/language_context";
import type { Schema } from "../lib/directus";
import { Button } from "./ui/button";

interface ChapterEditOrAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  initialData?: Schema["chapters"] | null;
  loading?: boolean;
}

export const ChapterEditOrAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}: ChapterEditOrAddModalProps) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setContent(initialData?.content || "");
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    await onSubmit({ title, content });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* 背景遮罩 */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in duration-200" />

        {/* 内容主体 */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-[101] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in data-[state=closed]:fade-out duration-200">
          {/* 头部 */}
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50 rounded-t-xl">
            <Dialog.Title className="text-lg font-bold text-slate-800">
              {initialData ? "编辑章节" : "新增章节"}
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600 transition-colors p-1 outline-none">
              ✕
            </Dialog.Close>
          </div>

          {/* 表单区域 */}
          <div className="p-6 space-y-5">
            <CustomInput
              label={t("chapter_title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入章节名称..."
              color="blue"
              autoFocus
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-0.5">
                章节内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-150 resize-none text-slate-700"
                placeholder="在此编写章节详细内容..."
              />
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
            <Dialog.Close asChild>
              <Button variant="ghost">取消</Button>
            </Dialog.Close>

            <Button
              onClick={handleSave}
              disabled={loading || !title}
              isLoading={loading}
            >
              保存修改
            </Button>
          </div>

          <Dialog.Description className="hidden">
            章节编辑表单，包含标题和内容输入。
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
