import { useRouter } from 'vue-router'

export default function useNotFound() {
  const router = useRouter()

  const goHome = () => {
    router.push('/')
  }

  const goBack = () => {
    router.go(-1)
  }

  return {
    goHome,
    goBack
  }
} 