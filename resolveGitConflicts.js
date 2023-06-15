#!/usr/bin/env zx

async function resolveGitConflicts() {
  // 判断是否有冲突文件
  const conflictFiles = String(
    await $`git diff --name-only --diff-filter=U`
  ).trim();
  if (!conflictFiles) {
    console.log('没有Git冲突文件');
    await $`yarn build`;
    console.log('yarn build命令已执行');
    return;
  }

  // 遍历冲突文件并自动解决
  for (const file of conflictFiles.split('\n')) {
    if (file.endsWith('index.src.js')) {
      await $`git checkout --ours ${file}`;
      console.log(`已使用当前文件内容覆盖旧的内容: ${file}`);
      await $`git add ${file}`;
      console.log(`已将文件标记为已解决: ${file}`);
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
    console.log('yarn build命令已执行');
  }
}

resolveGitConflicts();
