/** Метка для читателя вместо цифр спроса: цифры остаются в админке. */
export const growthNum = (g?: string | null) => Number(String(g || '').replace('×', '').replace(',', '.')) || 0

export const trendLabel = (g?: string | null) => (g === 'новый' ? 'Новый сюжет' : growthNum(g) >= 2 ? 'Сейчас популярно' : '')
