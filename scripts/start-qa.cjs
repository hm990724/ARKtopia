const {spawn}=require('node:child_process');
const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port','3001'],{stdio:'inherit',env:{...process.env,ARK_BUILD_QA:'1'}});
child.on('exit',code=>process.exit(code??1));child.on('error',e=>{console.error(e);process.exit(1)});
