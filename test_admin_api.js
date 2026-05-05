const fetch = require('node-fetch');

async function testAdminApi() {
  console.log('测试管理员API接口...\n');
  
  // 1. 首先注册一个测试用户
  console.log('1. 注册测试用户...');
  const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'testadmin@example.com',
      password: 'password123'
    })
  });
  
  if (registerResponse.ok) {
    console.log('✓ 用户注册成功');
  } else {
    const error = await registerResponse.text();
    console.log(`✗ 用户注册失败: ${error}`);
  }
  
  // 2. 登录获取token
  console.log('\n2. 登录获取JWT令牌...');
  const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'testadmin@example.com',
      password: 'password123'
    })
  });
  
  let token = '';
  if (loginResponse.ok) {
    const loginData = await loginResponse.json();
    token = loginData.token;
    console.log('✓ 登录成功，获取到JWT令牌');
    console.log(`  用户角色: ${loginData.user.role}`);
  } else {
    const error = await loginResponse.text();
    console.log(`✗ 登录失败: ${error}`);
    return;
  }
  
  // 3. 测试管理员升级接口（应该会失败，因为缺少adminCode）
  console.log('\n3. 测试管理员升级接口（缺少adminCode）...');
  const adminResponse1 = await fetch('http://localhost:3000/api/auth/admin/me', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({})
  });
  
  console.log(`   状态码: ${adminResponse1.status}`);
  if (!adminResponse1.ok) {
    const error = await adminResponse1.text();
    console.log(`   响应: ${error}`);
  }
  
  // 4. 测试管理员升级接口（使用错误的adminCode）
  console.log('\n4. 测试管理员升级接口（错误adminCode）...');
  const adminResponse2 = await fetch('http://localhost:3000/api/auth/admin/me', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      adminCode: 'wrong-code'
    })
  });
  
  console.log(`   状态码: ${adminResponse2.status}`);
  if (!adminResponse2.ok) {
    const error = await adminResponse2.text();
    console.log(`   响应: ${error}`);
  }
  
  // 5. 检查接口是否支持GET方法（应该返回405）
  console.log('\n5. 测试GET方法（应该返回405）...');
  const getResponse = await fetch('http://localhost:3000/api/auth/admin/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log(`   状态码: ${getResponse.status}`);
  console.log(`   状态文本: ${getResponse.statusText}`);
  
  console.log('\n测试完成！');
}

testAdminApi().catch(console.error);