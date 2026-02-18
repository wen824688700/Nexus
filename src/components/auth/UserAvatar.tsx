/**
 * 用户头像组件
 * 
 * 优先显示用户上传的头像，如果没有则显示基于用户名首字母的头像
 */

interface UserAvatarProps {
  user: {
    username?: string
    email: string
    avatar_url?: string
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  // 获取显示名称（优先用户名，否则用邮箱）
  const displayName = user.username || user.email
  
  // 获取首字母（支持中文和英文）
  const getInitial = (name: string): string => {
    if (!name) return '?'
    
    // 如果是邮箱，取 @ 前面的部分
    const cleanName = name.includes('@') ? name.split('@')[0] : name
    
    // 取第一个字符（支持中文）
    return cleanName.charAt(0).toUpperCase()
  }
  
  const initial = getInitial(displayName)
  
  // 根据首字母生成颜色（确保同一用户颜色一致）
  const getColorFromInitial = (char: string): string => {
    const colors = [
      'from-cyan-500 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-cyan-500',
      'from-rose-500 to-pink-500',
      'from-amber-500 to-orange-500',
    ]
    
    const charCode = char.charCodeAt(0)
    return colors[charCode % colors.length]
  }
  
  const gradientColor = getColorFromInitial(initial)
  
  // 尺寸映射
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-10 w-10 text-base',
    lg: 'h-24 w-24 text-3xl',
  }
  
  const sizeClass = sizeClasses[size]
  
  // 如果有头像 URL，尝试显示（但不使用 Next Image 避免超时问题）
  if (user.avatar_url) {
    return (
      <div className={`relative ${sizeClass} rounded-full overflow-hidden ${className}`}>
        <img
          src={user.avatar_url}
          alt={displayName}
          className="h-full w-full object-cover"
          onError={(e) => {
            // 加载失败时，隐藏图片，显示首字母头像
            e.currentTarget.style.display = 'none'
            const fallback = e.currentTarget.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        {/* 首字母头像作为 fallback */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${gradientColor} flex items-center justify-center font-semibold text-white`}
          style={{ display: 'none' }}
        >
          {initial}
        </div>
      </div>
    )
  }
  
  // 默认显示首字母头像
  return (
    <div 
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center font-semibold text-white ${className}`}
    >
      {initial}
    </div>
  )
}
