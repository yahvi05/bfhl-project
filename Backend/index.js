const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ================= MAIN API =================
app.post("/bfhl", (req, res) => {
    const data = req.body.data || [];
    const result = processData(data);
    res.json(result);
});

// ================= MAIN LOGIC =================
function processData(data) {
    const invalid_entries = [];
    const duplicate_edges = [];
    const validEdges = [];
    const seen = new Set();

    // Step 1: Validate + Remove duplicates
    data.forEach(edge => {
        const trimmed = edge.trim();

        if (!isValid(trimmed)) {
            invalid_entries.push(trimmed);
            return;
        }

        if (seen.has(trimmed)) {
            if (!duplicate_edges.includes(trimmed)) {
                duplicate_edges.push(trimmed);
            }
        } else {
            seen.add(trimmed);
            validEdges.push(trimmed);
        }
    });

    // Step 2: Build graph
    const { graph, childrenSet } = buildGraph(validEdges);

    // Step 3: Find roots
    let roots = Object.keys(graph).filter(n => !childrenSet.has(n));

    if (roots.length === 0 && Object.keys(graph).length > 0) {
        roots = [Object.keys(graph).sort()[0]];
    }

    let hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let maxDepth = 0;
    let largest_tree_root = null;

    // Step 4: Process each root
    roots.forEach(root => {
        const visited = new Set();
        const stack = new Set();

        if (detectCycle(root, graph, visited, stack)) {
            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });
            total_cycles++;
        } else {
            const tree = buildTree(root, graph);
            const depth = getDepth(root, graph);

            hierarchies.push({
                root,
                tree: { [root]: tree },
                depth
            });

            total_trees++;

            if (
                depth > maxDepth ||
                (depth === maxDepth && (largest_tree_root === null || root < largest_tree_root))
            ) {
                maxDepth = depth;
                largest_tree_root = root;
            }
        }
    });

    return {
        user_id: "yahvi_31032005",
        email_id: "ys7205@srmist.edu.in",
        college_roll_number: "RA2311008020037",
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    };
}

// ================= HELPERS =================

function isValid(edge) {
    const regex = /^[A-Z]->[A-Z]$/;
    if (!regex.test(edge)) return false;

    const [p, c] = edge.split("->");
    if (p === c) return false;

    return true;
}

function buildGraph(edges) {
    const graph = {};
    const childrenSet = new Set();

    edges.forEach(e => {
        const [p, c] = e.split("->");

        if (!graph[p]) graph[p] = [];
        graph[p].push(c);

        childrenSet.add(c);
    });

    return { graph, childrenSet };
}

function detectCycle(node, graph, visited, stack) {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    stack.add(node);

    for (let child of (graph[node] || [])) {
        if (detectCycle(child, graph, visited, stack)) return true;
    }

    stack.delete(node);
    return false;
}

function buildTree(node, graph) {
    let obj = {};

    for (let child of (graph[node] || [])) {
        obj[child] = buildTree(child, graph);
    }

    return obj;
}

function getDepth(node, graph) {
    if (!graph[node]) return 1;

    let max = 0;
    for (let child of graph[node]) {
        max = Math.max(max, getDepth(child, graph));
    }

    return max + 1;
}

// ================= START SERVER =================
app.listen(3000, () => console.log("Server running on port 3000"));