import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Label from "@radix-ui/react-label";
import {
  useCreateChapter,
  useFetchChaptersByProjectId,
} from "../queries/chapter.queries";
import type { Schema } from "../lib/directus";
interface AddChapterModalProps {
  projectId: string;
  onChapterCreated: (newChapter: Schema["chapters"]) => void;
}

export function AddChapterModal({
  projectId,
  onChapterCreated,
}: AddChapterModalProps) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { mutateAsync } = useCreateChapter();
  const { data: chapters } = useFetchChaptersByProjectId(projectId);
  const getNextSortOrder = () => {
    if (!chapters || chapters.length === 0) return 1; // 默认为 1 或 0
    // 提取所有 sort 值并找到最大值
    const maxSort = Math.max(...chapters.map((c) => c.sort || 0));
    return maxSort + 1;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await mutateAsync({
        project: projectId,
        title: title.trim(),
        content: content.trim() || null,
        sort: getNextSortOrder(),
      });
      onChapterCreated(res); // 通知父组件更新列表
      setOpen(false);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      alert("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          + 新增章节
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            新增章节
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-500">
            输入章节标题和内容（可选）
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <Label.Root className="block text-sm font-medium text-gray-700">
                标题 *
              </Label.Root>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="例如：第一章 引言"
                required
              />
            </div>

            <div>
              <Label.Root className="block text-sm font-medium text-gray-700">
                内容
              </Label.Root>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="可选，支持 Markdown 或纯文本..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  取消
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={!title.trim() || loading}
              >
                {loading ? "创建中..." : "创建"}
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
              X
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
