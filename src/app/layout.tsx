export default ({
  children,
}: {
  children: React.ReactNode
}) => {
  console.log('layout.tsx')
  return (
    <html lang="en">
      <body>
        {/* Layout UI */}
        {children}
      </body>
    </html>
  )
}