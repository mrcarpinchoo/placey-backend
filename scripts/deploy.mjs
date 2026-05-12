import { execSync } from "child_process";

const functions = [
  { name: "search-places", functionName: "placey-dev-search-places" },
  { name: "get-place", functionName: "placey-dev-get-place" }
];

for (const fn of functions) {
  const zip = `dist/${fn.name}.zip`;

  console.log(`Deploying ${fn.functionName}...`);

  execSync(
    `aws lambda update-function-code --function-name ${fn.functionName} --zip-file fileb://${zip}`,
    { stdio: "inherit" }
  );

  console.log(`Deployed ${fn.functionName}`);
}
