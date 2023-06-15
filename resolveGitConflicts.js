#!/usr/bin/env zx

async function resolveGitConflicts() {
  // 判断是否有冲突文件
  const conflictFiles = (await $`git diff --name-only --diff-filter=U`).trim();
  if (!conflictFiles) {
    console.log('没有Git冲突文件');
    return;
  }

  // 遍历冲突文件并自动解决
  for (const file of conflictFiles.split('\n')) {
    if (file.endsWith('index.src.js')) {
      await $`git checkout --ours ${file}`;
      await $`git add ${file}`;
    }
  }
  console.log('Git冲突已自动解决');
}

resolveGitConflicts();
