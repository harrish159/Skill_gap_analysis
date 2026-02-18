const authorize = (...roles) => {
    return (req, res, next) => {
        const userRole = (req.user?.role || "").toLowerCase();
        const normalizedRoles = roles.map(r => r.toLowerCase());

        if (!req.user || !normalizedRoles.includes(userRole)) {
            console.log(`Access Denied. User Role: ${req.user?.role}, Required: ${roles.join(", ")}`);
            return res.status(403).json({ message: "Access denied: Insufficient permissions" });
        }
        next();
    };
};

module.exports = authorize;
