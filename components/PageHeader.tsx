"use client"

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  )
}