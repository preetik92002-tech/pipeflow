import { Fragment, type CSSProperties } from 'react'

/**
 * Headline ko words mein todta hai taaki har word masked slide-up ke saath kram se aaye (CSS animation,
 * JavaScript ka intezaar nahi, isliye hero kabhi chhupa nahi rehta). Words ke beech asli space hai,
 * to screen reader, copy-paste aur wrapping bilkul normal rehte hain.
 */
export function SplitWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="word-mask">
            <span className="word" style={{ '--i': i } as CSSProperties}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}
