'use client'

import { Languages } from 'lucide-react'
import { useI18n, LANGS } from '@/lib/i18n'
import type { Lang } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function LangSwitch(): React.ReactElement {
  const { lang, setLang } = useI18n()
  return (
    <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
      <SelectTrigger className="h-9 w-auto gap-1.5 border-none bg-transparent px-2 shadow-none focus:ring-0">
        <Languages className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {LANGS.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
