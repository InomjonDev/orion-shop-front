'use client'

import type { OrderStatus } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'

const VARIANT: Record<OrderStatus, 'default' | 'success' | 'secondary' | 'destructive'> = {
  new: 'default',
  confirmed: 'default',
  fulfilled: 'success',
  cancelled: 'destructive'
}

export function OrderStatusBadge({ status }: { status: OrderStatus }): React.ReactElement {
  const { t } = useI18n()
  return <Badge variant={VARIANT[status]}>{t(`status.${status}`)}</Badge>
}
