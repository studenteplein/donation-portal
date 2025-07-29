import { LucideIcon } from 'lucide-react'

interface ProjectCard {
  icon: LucideIcon
  title: string
  description: string
}

interface ProjectShowcaseProps {
  projects: ProjectCard[]
}

export function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
      {projects.map((project, index) => {
        const IconComponent = project.icon
        return (
          <div 
            key={index}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-br-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg leading-tight">
                {project.title}
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {project.description}
            </p>
          </div>
        )
      })}
    </div>
  )
} 