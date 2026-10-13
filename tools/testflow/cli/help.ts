export function printHelp(): void {
  console.log(`
TestFlow CLI

Usage:
  testflow <command> [options]

Commands:
  doctor       Validate the local TestFlow environment
  import       Import a TestFlow Recorder JSON
  validate     Validate a recording
  inspect      Inspect a recording
  index        Index the existing automation repository
  design       Create functional test design
  plan         Create an implementation plan
  generate     Generate approved implementation
  review       Run architecture and quality review
  test         Execute Playwright tests
  analyze      Analyze execution failures
  heal         Propose safe healing changes

Global:
  --help       Show this help
  --version    Show CLI version

Workflow:
  import -> validate -> inspect -> index -> design -> plan
         -> generate -> review -> test -> analyze -> heal
`);
}
