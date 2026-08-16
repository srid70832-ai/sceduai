const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// The replacement starts at `app.post('/api/auth/register'` and ends before `app.post('/api/auth/forgot-password'`
const registerRegex = /app\.post\('\/api\/auth\/register', \(req, res\) => \{[\s\S]*?\}\);\n\napp\.post\('\/api\/auth\/forgot-password'/;

const newAuthCode = `
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, password, role, department, roll_number, employee_code, major } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Full name, email, password, and role are required.' } });
    }

    if (role === 'ADMIN') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Public registration for ADMIN role is strictly prohibited.' } });
    }

    if (role !== 'STUDENT' && role !== 'TEACHER') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Role must be either STUDENT or TEACHER.' } });
    }

    // Call Supabase GoTrue Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password,
      options: {
        data: {
          full_name,
          role
        }
      }
    });

    if (authError) {
      return res.status(400).json({ success: false, error: { code: 'SUPABASE_AUTH_ERROR', message: authError.message } });
    }

    const auth_user_id = authData.user?.id;
    if (!auth_user_id) {
       return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve user ID from Supabase.' } });
    }

    const selectedDepartment = department || 'Artificial Intelligence and Data Science';

    const profile = db.insert('profiles', {
      id: auth_user_id, // Match UUID
      auth_user_id,
      full_name,
      email: email.toLowerCase().trim(),
      role,
      department: selectedDepartment,
      avatar_url: \`https://ui-avatars.com/api/?name=\${encodeURIComponent(full_name)}&background=random\`
    });

    let student = null;
    let teacher = null;

    if (role === 'STUDENT') {
      student = db.insert('students', {
        profile_id: profile.id,
        roll_number: roll_number || \`STU-\${Math.floor(1000 + Math.random() * 9000)}\`,
        enrollment_year: new Date().getFullYear(),
        semester: 1,
        major: major || selectedDepartment,
        academic_status: 'ACTIVE'
      });
    } else if (role === 'TEACHER') {
      teacher = db.insert('teachers', {
        profile_id: profile.id,
        employee_code: employee_code || \`FAC-\${Math.floor(100 + Math.random() * 900)}\`,
        qualification: 'Master of Science / Ph.D.',
        specialization: selectedDepartment,
        designation: 'Lecturer'
      });
    }

    db.logAudit('USER_REGISTERED', 'profile', profile.id, profile.email, profile.id, { role });

    res.json({
      success: true,
      data: {
        user: profile,
        student,
        teacher,
        token: authData.session?.access_token || profile.id
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

app.post('/api/auth/forgot-password'`;

content = content.replace(registerRegex, newAuthCode);


const loginRegex = /app\.post\('\/api\/auth\/login', \(req, res\) => \{[\s\S]*?\}\);\n\napp\.get\('\/api\/auth\/me'/;
const newLoginCode = `
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Email and password are required.' } });
    }

    // Call Supabase GoTrue Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: authError?.message || 'Invalid credentials' } });
    }

    const auth_user_id = authData.user.id;
    let profile = db.find('profiles', (p) => p.auth_user_id === auth_user_id || p.email.toLowerCase() === email.toLowerCase().trim())[0];
    
    if (!profile) {
      return res.status(401).json({ success: false, error: { code: 'PROFILE_MISSING', message: 'User authenticated but profile not found in database.' } });
    }

    const student = profile.role === 'STUDENT' ? db.find('students', (s) => s.profile_id === profile.id)[0] : null;
    const teacher = profile.role === 'TEACHER' ? db.find('teachers', (t) => t.profile_id === profile.id)[0] : null;
    const admin = profile.role === 'ADMIN' ? db.find('administrators', (a) => a.profile_id === profile.id)[0] : null;

    db.logAudit('USER_LOGIN', 'profile', profile.id, profile.email, profile.id);

    res.json({
      success: true,
      data: {
        user: profile,
        student,
        teacher,
        admin,
        token: authData.session?.access_token || profile.id
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

app.get('/api/auth/me'`;

content = content.replace(loginRegex, newLoginCode);

fs.writeFileSync('server.ts', content);
