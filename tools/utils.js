var fs = require('fs');

class TreeNode {
  path;
  children;

  constructor(path) {
    this.path = path;
    this.children = [];
  }
}

const buildTree = (rootPath) => {
  const root = new TreeNode(rootPath);

  const stack = [root];

  while (stack.length) {
    const currentNode = stack.pop();

    if (currentNode) {
      const children = fs.readdirSync(currentNode.path);

      for (let child of children) {
        const childPath = `${currentNode.path}/${child}`;
        const childNode = new TreeNode(childPath);
        currentNode.children.push(childNode);

        if (fs.statSync(childNode.path).isDirectory()) {
          stack.push(childNode);
        }
      }
    }
  }

  return root;
};

const transformTsToJs = (node) => {
  //   console.log(node);
  node.children.forEach((childNode) => {
    if (childNode.children && childNode.children.length) {
      transformTsToJs(childNode);
    } else {
      // transform only ts files
      if (childNode.path.includes('.js') || childNode.path.includes('.jsx')) {
        return;
      }

      // Transform
      let result = require('@babel/core').transformSync(fs.readFileSync(childNode.path), {
        filename: childNode.path,
        presets: ['@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-typescript'],
      });

      // Save new file
      let newFilePath;
      if (childNode.path.includes('.ts')) {
        console.log('if1');
        newFilePath = childNode.path.replace('.ts', '.js');
        fs.writeFileSync(newFilePath, result.code);
      }
      if (childNode.path.includes('.tsx')) {
        console.log('if2');
        newFilePath = childNode.path.replace('.tsx', '.jsx');
        fs.writeFileSync(newFilePath, result.code);
      }
      // console.log(newFilePath);

      // delete main ts files
      if (childNode.path.includes('.ts') || childNode.path.includes('.tsx')) {
        fs.unlinkSync(childNode.path);
      }
    }
  });
};

const createJsConfig = (outdir) => {
  fs.writeFileSync(
    outdir,
    `{
    "compilerOptions": {
        "baseUrl": "src"
    },
    "include": ["src"]
}`,
  );
};

module.exports = {
  buildTree,
  transformTsToJs,
  createJsConfig,
};
