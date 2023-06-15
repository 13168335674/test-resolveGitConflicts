import 'zx/globals';
import fs from 'node:fs';
import path from 'node:path';

const MIN_NODE_VERSION = 16;

async function checkPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('当前目录下不存在package.json文件');
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (pkg.author !== 'hd') {
    console.log('package.json文件中author字段不为hd');
    return false;
  }

  const voltaNodeVersion = pkg?.volta?.node || MIN_NODE_VERSION;

  return voltaNodeVersion;
}

async function checkEnvironment() {
  const voltaNodeVersion = await checkPackageJson();
  if (!voltaNodeVersion) {
    return false;
  }

  // 检查Node.js版本
  const v = parseInt(process.version.slice(1));
  if (v < MIN_NODE_VERSION) {
    console.log(
      `Node.js版本过低，请升级到Node.js ${voltaNodeVersion}或更高版本`
    );
    return false;
  }

  return true;
}

async function resolveGitConflicts() {
  const isEnvironmentOK = await checkEnvironment();
  if (!isEnvironmentOK) {
    console.log('环境检查未通过，无法自动解决Git冲突');
    return;
  }
  // 判断是否有冲突文件
  const conflictFiles = String(
    await $`git diff --name-only --diff-filter=U`
  ).trim();
  if (!conflictFiles) {
    console.log('没有Git冲突文件');
    return;
  }

  // 遍历冲突文件并自动解决
  for (const file of conflictFiles.split('\n')) {
    if (file.endsWith('index.src.js')) {
      await $`git checkout --ours ${file}`;
      await $`git add ${file}`;
      console.log(`文件冲突已解决: ${file}`);
    }
  }

  // 判断是否有未解决的冲突文件
  const remainingConflicts = String(
    await $`git diff --name-only --diff-filter=U`
  ).trim();
  if (remainingConflicts) {
    console.log(`以下文件存在冲突需要等待处理: ${remainingConflicts}`);
  } else {
    await $`yarn build`;
  }
}

resolveGitConflicts();
