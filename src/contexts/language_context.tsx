import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import { SecureStorage, SECURE_KEYS } from "../utils/storage_utils";
type Language = "en" | "zh";

interface Translations {
  [key: string]: {
    [translationKey: string]: string;
  };
}

interface LanguageContextType {
  currentLang: Language;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const translations: Translations = {
  en: {
    set_pin: "For first-time use, please set a PIN for login",
    confirm_pin: "Confirm PIN",
    button: "En",
    setup_error: "Error during setup. Please try again.",
    submit: "Submit",
    home: "Home",
    placeholder_pin: "4 digit PIN code",
    placeholder_confirm_pin: "Repeat your PIN code",
    yup_required: "This field is required.",
    yup_pin_format: "PIN must be exactly 4 digits.",
    yup_pin_mismatch: "The two PINs must be the same.",
    unlock: "Please enter your local secure PIN code.",
    processing: "Verifying and fetching Token...",
    pin_incorrect: "Incorrect PIN. Please try again.",
    error_data_lost: "Error: Data lost. Please try again.",
    auth_expired_or_failed:
      "Authentication expired or failed. Please try again.",
    server_connection_error: "Server connection error. Please try again.",
    unknown_error: "Unknown error. Please try again.",
    work_management: "Work Management",
    work_title: "Work Title",
    chapter_title: "Chapter Title(limit 255 characters)",
    placeholder_work_title: "Enter the title of your work",
    create_work: "Create Work",
    my_works: "My Works",
    work_empty: "No works found. Create your first work!",
    create_failed: "Creation failed. Please try again.",
    delete_failed: "Deletion failed. Please try again.",
    no_more: "No more news.",
    delete_title: "Delete",
    delete_confirm:
      "Are you sure you want to delete this and all its contents?",
    confirm_delete: "Confirm Delete",
    cancel: "Cancel",
    error_crypto_execution: "Crypto execution failed. Please try again.",
    error_crypto_unsupported:
      "Crypto is not supported in this environment. Please try in a different browser or update.",
    error_network_or_server: "Network or server error. Please try again.",
    error_auth_service: "Authentication service error. Please try again.",
    empty: "No data available.",
    title_error: "Title cannot be empty.",
    chapter_modal_title_edit: "Edit Chapter",
    chapter_modal_title_add: "Add Chapter",
    chapter_content: "Chapter Content(limit 5000 characters)",
    chapter_title_placeholder: "Enter the title of the chapter",
    chapter_content_placeholder: "Enter the content of the chapter",
    save_changes: "Save Changes",
  },
  zh: {
    set_pin: "首次使用，请设置 PIN 码用于登录",
    confirm_pin: "确认 PIN",
    button: "中",
    setup_error: "初始化过程中出现错误，请重试。",
    submit: "提交",
    home: "首页",
    placeholder_pin: "4 位数字 PIN 码",
    placeholder_confirm_pin: "重复输入您的 PIN 码",
    yup_required: "此项为必填项。",
    yup_pin_format: "PIN 必须是严格的 4 位数字。",
    yup_pin_mismatch: "两次输入的 PIN 必须保持一致。",
    unlock: "请输入您的本地安全 PIN 码。",
    processing: "正在验证并获取 Token...",
    pin_incorrect: "PIN 码错误，请重试。",
    error_data_lost: "数据丢失错误，请重试。",
    auth_expired_or_failed: "认证过期或失败，请重试。",
    server_connection_error: "服务器连接错误，请重试。",
    unknown_error: "未知错误，请重试。",
    work_management: "作品管理",
    work_title: "作品标题",
    chapter_title: "章节标题(最长255字符)",
    placeholder_work_title: "输入您的作品标题",
    create_work: "创建作品",
    my_works: "我的作品",
    work_empty: "未找到作品，创建您的第一个作品！",
    create_failed: "创建失败，请重试。",
    delete_failed: "删除失败，请重试。",
    no_more: "到底了。",
    delete_title: "删除",
    delete_confirm: "确认其下内容全部删除吗？",
    confirm_delete: "确认删除",
    cancel: "取消",
    error_crypto_execution: "加密用户数据执行失败，请重试。",
    error_crypto_unsupported:
      "当前环境不支持加密，请在不同浏览器或更新浏览器后重试。",
    error_network_or_server: "网络或服务器错误，请重试。",
    error_auth_service: "认证服务错误，请重试。",
    empty: "暂无数据。",
    title_error: "标题不能为空。",
    chapter_modal_title_edit: "编辑章节",
    chapter_modal_title_add: "新增章节",
    chapter_content: "章节内容(最长5000字符)",
    chapter_title_placeholder: "输入章节标题",
    chapter_content_placeholder: "输入章节内容",
    save_changes: "保存修改",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  useEffect(() => {
    const initLanguage = async () => {
      const value = await SecureStorage.getItem(SECURE_KEYS.APP_LANGUAGE);
      if (value === "en" || value === "zh") {
        setCurrentLang(value);
      }
    };
    initLanguage();
  }, []);
  const t = (key: string): string => {
    return translations[currentLang]?.[key] || key;
  };

  const toggleLanguage = (): void => {
    setCurrentLang((prevLang) => {
      const newLang = prevLang === "en" ? "zh" : "en";
      SecureStorage.setItem(SECURE_KEYS.APP_LANGUAGE, newLang);
      return newLang;
    });
  };

  const value: LanguageContextType = {
    currentLang,
    t,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider component"
    );
  }

  return context;
};
