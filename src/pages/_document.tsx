   // src/pages/_document.tsx

   import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

   class MyDocument extends Document {
     static async getInitialProps(ctx: DocumentContext) {
       const initialProps = await Document.getInitialProps(ctx)
       return { ...initialProps }
     }

     render() {
       return (
         <Html>
           <Head>
             <link rel="icon" href="/favicon.ico" type="image/x-icon" />
             <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
             <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
            <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
   
           </Head>
           <body>
             <Main />
             <NextScript />
           </body>
         </Html>
       )
     }
   }

   export default MyDocument