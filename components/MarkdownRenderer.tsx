type Props = { html: string }

export default function MarkdownRenderer({ html }: Props) {
  const htmlProps = { __html: html }
  // dangerouslySetInnerHTML renders raw HTML — safe here because html comes from remark, not user input
  return <div className="prose prose-slate max-w-none" {...{ dangerouslySetInnerHTML: htmlProps }} />
}