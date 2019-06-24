/**
 * the KSNode is what's in the tree view.
 * It contains the information necessary to generate a
 */
interface KSNode {
  path: string;
}

interface KSNodeDisplay {
  name: string;
  length: string;
  content?: string;
}

/*
name: path,
length: Z [start - end]
content?: content
*/