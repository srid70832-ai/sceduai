export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const dbMethods = ['find', 'findById', 'insert', 'update', 'delete', 'getRaw', 'logAudit', 'createNotification'];

  // Find all CallExpressions of db.method()
  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'db' },
      property: { name: (name) => dbMethods.includes(name) }
    }
  }).forEach(path => {
    // Wrap the CallExpression in an AwaitExpression if it isn't already
    if (path.parentPath.value.type !== 'AwaitExpression') {
      j(path).replaceWith(j.awaitExpression(path.value));
    }

    // Traverse up to find the closest enclosing Function
    let current = path;
    while (current && current.node.type !== 'FunctionDeclaration' && current.node.type !== 'FunctionExpression' && current.node.type !== 'ArrowFunctionExpression') {
      current = current.parentPath;
    }
    
    // Make the function async
    if (current) {
      current.node.async = true;
    }
  });

  // Also make getAuthUser calls awaited
  root.find(j.CallExpression, {
    callee: { name: 'getAuthUser' }
  }).forEach(path => {
    if (path.parentPath.value.type !== 'AwaitExpression') {
      j(path).replaceWith(j.awaitExpression(path.value));
    }
    let current = path;
    while (current && current.node.type !== 'FunctionDeclaration' && current.node.type !== 'FunctionExpression' && current.node.type !== 'ArrowFunctionExpression') {
      current = current.parentPath;
    }
    if (current) {
      current.node.async = true;
    }
  });

  // Make getAuthUser itself async
  root.find(j.FunctionDeclaration, { id: { name: 'getAuthUser' } }).forEach(path => {
    path.node.async = true;
  });

  return root.toSource();
}
