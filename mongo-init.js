// MongoDB initialization script
db = db.getSiblingDB('expense_management');

// Create collections with initial indexes
db.createCollection('users');
db.createCollection('companies');
db.createCollection('expenses');
db.createCollection('approvalworkflows');
db.createCollection('tokens');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ company: 1 });
db.users.createIndex({ role: 1 });

db.companies.createIndex({ name: 1 });
db.companies.createIndex({ createdBy: 1 });

db.expenses.createIndex({ submittedBy: 1 });
db.expenses.createIndex({ company: 1 });
db.expenses.createIndex({ status: 1 });
db.expenses.createIndex({ date: -1 });
db.expenses.createIndex({ company: 1, status: 1, date: -1 });

db.approvalworkflows.createIndex({ company: 1 });
db.approvalworkflows.createIndex({ isActive: 1 });
db.approvalworkflows.createIndex({ priority: -1 });

db.tokens.createIndex({ userId: 1 });
db.tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('Database initialized successfully!');
