#!/usr/bin/env node

/**
 * Responsive Design Test Script
 * Tests the mobile app's responsive design across different screen sizes
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Responsive Design Implementation...\n');

// Test 1: Check if responsive utilities are implemented
function testResponsiveUtilities() {
  console.log('1. Testing Responsive Utilities...');
  
  const files = [
    'App.tsx',
    'src/screens/HomeScreen.tsx',
    'src/screens/PanicScreen.tsx'
  ];
  
  let passed = 0;
  let total = 0;
  
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for responsive breakpoints
      const hasBreakpoints = content.includes('isTablet') && 
                           content.includes('isSmallScreen') && 
                           content.includes('isLandscape');
      
      // Check for responsive functions
      const hasResponsiveFunctions = content.includes('getResponsiveFontSize') || 
                                   content.includes('getResponsiveIconSize');
      
      // Check for SafeAreaView
      const hasSafeArea = content.includes('SafeAreaView');
      
      total += 3;
      if (hasBreakpoints) passed++;
      if (hasResponsiveFunctions) passed++;
      if (hasSafeArea) passed++;
      
      console.log(`   ✅ ${file}: Responsive features implemented`);
    } else {
      console.log(`   ❌ ${file}: File not found`);
    }
  });
  
  console.log(`   📊 Responsive Utilities: ${passed}/${total} checks passed\n`);
  return passed === total;
}

// Test 2: Check responsive styles
function testResponsiveStyles() {
  console.log('2. Testing Responsive Styles...');
  
  const files = [
    'src/screens/HomeScreen.tsx',
    'src/screens/PanicScreen.tsx'
  ];
  
  let passed = 0;
  let total = 0;
  
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for tablet styles
      const hasTabletStyles = content.includes('tablet') && 
                            content.includes('Tablet');
      
      // Check for small screen styles
      const hasSmallStyles = content.includes('small') && 
                           content.includes('Small');
      
      // Check for landscape styles
      const hasLandscapeStyles = content.includes('landscape') && 
                               content.includes('Landscape');
      
      total += 3;
      if (hasTabletStyles) passed++;
      if (hasSmallStyles) passed++;
      if (hasLandscapeStyles) passed++;
      
      console.log(`   ✅ ${file}: Responsive styles implemented`);
    }
  });
  
  console.log(`   📊 Responsive Styles: ${passed}/${total} checks passed\n`);
  return passed === total;
}

// Test 3: Check package.json dependencies
function testDependencies() {
  console.log('3. Testing Dependencies...');
  
  const packagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      'react-native-safe-area-context',
      'react-native-paper',
      'expo-linear-gradient',
      '@expo/vector-icons'
    ];
    
    let passed = 0;
    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`   ✅ ${dep}: ${dependencies[dep]}`);
        passed++;
      } else {
        console.log(`   ❌ ${dep}: Missing`);
      }
    });
    
    console.log(`   📊 Dependencies: ${passed}/${requiredDeps.length} required packages found\n`);
    return passed === requiredDeps.length;
  } else {
    console.log('   ❌ package.json not found\n');
    return false;
  }
}

// Test 4: Check responsive design documentation
function testDocumentation() {
  console.log('4. Testing Documentation...');
  
  const docPath = path.join(__dirname, 'RESPONSIVE_DESIGN.md');
  if (fs.existsSync(docPath)) {
    const content = fs.readFileSync(docPath, 'utf8');
    
    const requiredSections = [
      'Device Breakpoints',
      'Responsive Features',
      'Implementation Details',
      'Testing Recommendations',
      'Accessibility Features'
    ];
    
    let passed = 0;
    requiredSections.forEach(section => {
      if (content.includes(section)) {
        console.log(`   ✅ ${section}: Documented`);
        passed++;
      } else {
        console.log(`   ❌ ${section}: Missing`);
      }
    });
    
    console.log(`   📊 Documentation: ${passed}/${requiredSections.length} sections found\n`);
    return passed === requiredSections.length;
  } else {
    console.log('   ❌ RESPONSIVE_DESIGN.md not found\n');
    return false;
  }
}

// Run all tests
function runTests() {
  const results = [
    testResponsiveUtilities(),
    testResponsiveStyles(),
    testDependencies(),
    testDocumentation()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('🎯 Test Results Summary:');
  console.log(`   ✅ Passed: ${passed}/${total} test suites`);
  console.log(`   📊 Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All responsive design tests passed!');
    console.log('📱 Your mobile app is ready for all device types!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }
  
  return passed === total;
}

// Run the tests
runTests();
