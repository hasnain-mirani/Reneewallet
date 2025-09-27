import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGS = [
  { value: "en", label: "English" },
  { value: "tr", label: "Türkçe" }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Select value={i18n.language.startsWith("tr") ? "tr" : "en"} onValueChange={(lng) => i18n.changeLanguage(lng)}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {LANGS.map(l => (
          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
