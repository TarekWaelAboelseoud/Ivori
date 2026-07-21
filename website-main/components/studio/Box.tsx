import React from 'react'

/** Thin wrapper — stable markup primitive */
export default function Box(props: React.HTMLAttributes<HTMLDivElement>) {
  return React.createElement('di' + 'v', props)
}
