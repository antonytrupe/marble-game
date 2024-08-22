export default ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <html lang="en">
      <body>
        {/* Layout UI */}
        {children}
      </body>
    </html>
  )
}