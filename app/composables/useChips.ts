import type { ChipConfig } from '../../types/index'

export const useChips = () => {
  const chips = useState<ChipConfig | null>('chips', () => null)

  const fetchChips = async () => {
    const { data } = await useFetch<ChipConfig>('/api/config')
    if (data.value) {
      chips.value = data.value
    }
  }

  const getOptions = (category: string): string[] => {
    if (!chips.value) return []
    return chips.value[category] || []
  }

  return {
    chips,
    fetchChips,
    getOptions
  }
}
