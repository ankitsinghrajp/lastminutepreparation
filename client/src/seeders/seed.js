// seedPYQData.js
import axios from "axios";
const sampleQuestions = 

const bulkUploadPYQ = async () => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/v1/pyq/admin/bulk-upload',
      {
        questions: sampleQuestions
      },
      {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if required
          // 'Authorization': 'Bearer your-admin-token-here'
        }
      }
    );

    console.log('✅ Bulk upload successful!');
    console.log(`📊 ${response.data.message}`);
    console.log(`📝 Uploaded ${response.data.data.length} questions`);
    
  } catch (error) {
    console.error('❌ Bulk upload failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${error.response.data.message}`);
      
      // More detailed error logging
      if (error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
};

// Run the seeder
bulkUploadPYQ();