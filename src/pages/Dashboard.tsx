import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../stores/auth_store";
import { useTokenRefresh } from "../hooks/use_token_refresh";
import {
  useFetchUserProjects,
  useCreateProject,
} from "../queries/projects.queries";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { checkAndRefreshToken } = useTokenRefresh();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const checkedRef = useRef(false);
  const userId = useAuthStore((state) => state.userId);
  const projects = useFetchUserProjects(userId).data;
  const [isCreating, setIsCreating] = useState(false);
  const createProjectMutation = useCreateProject(userId);
  const handleAddProject = async () => {
    if (!userId) {
      console.warn("no userId, cannot create project");
      return;
    }
    // 简单 prompt，生产可换成 Modal 组件
    const title = window.prompt("New project title", "Untitled");
    if (title === null) return; // 用户取消

    setIsCreating(true);
    try {
      const res = await createProjectMutation.mutateAsync({ title });
      const slug = res?.data?.id || res?.id;
      if (!slug) {
        console.error("create project failed:", res);
        alert("创建项目失败，请检查控制台。");
        return;
      }

      // 跳转到编辑页面
      navigate(`/project/${slug}`);
    } catch (e) {
      console.error("create project error", e);
      alert("创建项目发生错误");
    } finally {
      setIsCreating(false);
    }
  };
  // useEffect(() => {
  //   let mounted = true;
  //   if (!isAuthenticated) {
  //     navigate("/", { replace: true });
  //     return;
  //   }
  //   if (checkedRef.current) {
  //     setIsAuthChecking(false);
  //     return;
  //   }

  //   const check = async () => {
  //     try {
  //       const isValid = await checkAndRefreshToken();
  //       if (!mounted) return;
  //       if (!isValid) {
  //         navigate("/", { replace: true });
  //         return;
  //       }
  //       checkedRef.current = true;
  //     } catch (e) {
  //       if (mounted) navigate("/", { replace: true });
  //     } finally {
  //       if (mounted) setIsAuthChecking(false);
  //     }
  //   };

  //   check();

  //   return () => {
  //     mounted = false;
  //   };
  // }, [isAuthenticated, checkAndRefreshToken]);

  // if (isAuthChecking || !isAuthenticated) {
  //   return (
  //     <div className="flex justify-center items-center h-screen bg-gray-100">
  //       <p>正在验证您的会话安全...</p>
  //     </div>
  //   );
  // }

  return (
    <div>
      <h1>我的笔记 ({projects?.length})</h1>
      <ul>
        {projects?.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => {
                navigate(`/project/${p.id}`);
              }}
            >
              {p.title}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleAddProject} disabled={isCreating}>
        {isCreating ? "Creating…" : "Add"}
      </button>
    </div>
  );
};

export default Dashboard;
