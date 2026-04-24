function isValid(edge) {
    const regex = /^[A-Z]->[A-Z]$/;
    if (!regex.test(edge)) return false;

    const [p, c] = edge.split("->");
    if (p === c) return false;

    return true;
}