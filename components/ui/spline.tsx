import * as React from 'react'
const Spline = React.lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <React.Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-slate-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
      />
    </React.Suspense>
  )
}