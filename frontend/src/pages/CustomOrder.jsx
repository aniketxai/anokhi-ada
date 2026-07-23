import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileUp, CheckCircle2, X, Loader, Sparkles, Zap } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import Button from '../components/Button';
import { submitCustomOrder } from '../api/index.js';

export default function CustomOrder() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    specifications: '',
    quantity: 1,
    budget: '',
    deadline: '',
  });
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ['.stl', '.obj', '.iges', '.step', '.stp', '.dwg', '.pdf'];
      const fileExt = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        setError('Invalid file type. Accepted: STL, OBJ, IGES, STEP, STP, DWG, PDF');
        return;
      }

      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!form.name || !form.email || !form.phone || !form.description) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('description', form.description);
      formData.append('specifications', form.specifications);
      formData.append('quantity', form.quantity);
      formData.append('budget', form.budget);
      formData.append('deadline', form.deadline);
      
      if (file) {
        formData.append('file', file);
      }

      await submitCustomOrder(formData);
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        description: '',
        specifications: '',
        quantity: 1,
        budget: '',
        deadline: '',
      });
      setFile(null);
      setFileName('');
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      console.error('Custom order submission failed:', err);
      setError(err.message || 'Failed to submit custom order request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-linear-to-br from-background via-surface to-background overflow-x-hidden">
      <BlurBlob className="w-64 h-64 sm:w-80 sm:h-80 top-20 right-6 bg-secondary-container opacity-40 pointer-events-none" />
      <BlurBlob className="w-52 h-52 sm:w-72 sm:h-72 bottom-20 left-6 bg-accent-glow opacity-40 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          label="Bring Your Ideas to Life"
          title="Custom Order"
          description="Get a tailored solution designed specifically for your needs"
        />

        {/* Success Message */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-8 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800/50 rounded-3xl p-6 flex items-start gap-4 backdrop-blur-sm"
          >
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50 shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-green-900 dark:text-green-100 mb-2 text-lg">
                Request Submitted Successfully! 🎉
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                We've received your custom order request. Our team will review your specifications and send you a personalized quote within 24-48 hours via email.
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-linear-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200 dark:border-red-800/50 rounded-3xl p-6 flex items-start gap-4 backdrop-blur-sm"
          >
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 shrink-0">
              <X className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 dark:text-red-100 mb-1">Error</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8"
        >
          {/* Left Column - Form */}
          <div className="md:col-span-7">
            <form id="custom-order-form" onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-linear-to-br from-surface-container/90 to-surface-container/60 backdrop-blur-xl rounded-2xl p-3.5 md:p-5 border border-outline/20 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
                    <div className="p-1 md:p-1.5 rounded-lg bg-linear-to-br from-primary/20 to-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-foreground">Your Information</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1.5 md:mb-2">
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-surface/60 border-2 border-outline/20 focus:border-primary focus:bg-surface focus:outline-none text-sm text-foreground placeholder:text-secondary-text transition-all duration-200 hover:border-outline/40 focus:shadow-lg focus:shadow-primary/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 md:mb-2">
                      Email <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-surface/60 border-2 border-outline/20 focus:border-primary focus:bg-surface focus:outline-none text-sm text-foreground placeholder:text-secondary-text transition-all duration-200 hover:border-outline/40 focus:shadow-lg focus:shadow-primary/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 md:mb-2">
                      Phone <span className="text-primary">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-surface/60 border-2 border-outline/20 focus:border-primary focus:bg-surface focus:outline-none text-sm text-foreground placeholder:text-secondary-text transition-all duration-200 hover:border-outline/40 focus:shadow-lg focus:shadow-primary/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 md:mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-surface/60 border-2 border-outline/20 focus:border-primary focus:bg-surface focus:outline-none text-sm text-foreground transition-all duration-200 hover:border-outline/40 focus:shadow-lg focus:shadow-primary/10"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Project Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-linear-to-br from-surface-container/90 to-surface-container/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-outline/20 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-5">
                    <div className="p-1 md:p-1.5 rounded-lg bg-linear-to-br from-secondary/20 to-secondary/10">
                    <Zap className="w-4 h-4 text-secondary" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-foreground">Project Details</h3>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 md:mb-2">
                      Tell us about your project <span className="text-primary">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe your custom order requirements, what you're looking to create, and any specific use cases..."
                      rows="3"
                      className="w-full px-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-surface/60 border-2 border-outline/20 focus:border-primary focus:bg-surface focus:outline-none text-sm text-foreground placeholder:text-secondary-text transition-all duration-200 hover:border-outline/40 resize-none focus:shadow-lg focus:shadow-primary/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 md:mb-2">
                      Technical Specifications
                    </label>
                    <textarea
                      name="specifications"
                      value={form.specifications}
                      onChange={handleChange}
                      placeholder="Dimensions, materials, tolerances, finishes, colors, etc."
                      rows="2"
                      className="w-full px-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-surface/60 border-2 border-outline/20 focus:border-primary focus:bg-surface focus:outline-none text-sm text-foreground placeholder:text-secondary-text transition-all duration-200 hover:border-outline/40 resize-none focus:shadow-lg focus:shadow-primary/10"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Timeline & Budget */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-linear-to-br from-surface-container/90 to-surface-container/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-outline/20 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-5">
                  <div className="p-1 md:p-1.5 rounded-lg bg-linear-to-br from-accent-glow/20 to-accent-glow/10">
                    <Upload className="w-4 h-4 text-accent-glow" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-foreground">Timeline & Budget</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 md:mb-2">
                      Preferred Delivery Date
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={form.deadline}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-surface/60 border-2 border-outline/20 focus:border-primary focus:bg-surface focus:outline-none text-sm text-foreground transition-all duration-200 hover:border-outline/40 focus:shadow-lg focus:shadow-primary/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 md:mb-2">
                      Budget Range
                    </label>
                    <input
                      type="text"
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="₹5,000 - ₹10,000"
                      className="w-full px-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-surface/60 border-2 border-outline/20 focus:border-primary focus:bg-surface focus:outline-none text-sm text-foreground placeholder:text-secondary-text transition-all duration-200 hover:border-outline/40 focus:shadow-lg focus:shadow-primary/10"
                    />
                  </div>
                </div>
              </motion.div>

            </form>
          </div>

          {/* Right Column - File Upload & Info */}
          <div className="md:col-span-5 space-y-6 md:space-y-8">
            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="bg-linear-to-br from-surface-container/90 to-surface-container/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-primary/20 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-6 right-6 w-20 md:w-28 h-20 md:h-28 bg-primary/5 rounded-full group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute bottom-6 left-6 w-16 md:w-24 h-16 md:h-24 bg-secondary/5 rounded-full" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 md:p-1.5 rounded-lg bg-primary/10">
                      <FileUp className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-foreground">Upload Design File</h3>
                  </div>
                  <p className="text-xs text-secondary-text mb-3 md:mb-4">Optional but speeds up quote</p>
                
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".stl,.obj,.iges,.step,.stp,.dwg,.pdf"
                    className="hidden"
                    id="file-input"
                  />
                  
                  <label
                    htmlFor="file-input"
                    className="block cursor-pointer mb-3 md:mb-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="border-3 border-dashed border-primary/40 rounded-lg md:rounded-xl p-4 md:p-6 hover:border-primary hover:bg-primary/5 transition-all duration-300 group/upload"
                    >
                      <div className="flex flex-col items-center justify-center">
                        {fileName ? (
                          <>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="p-1.5 md:p-3 rounded-full bg-linear-to-br from-primary/20 to-primary/10 mb-2 md:mb-3"
                            >
                              <FileUp className="w-6 h-6 text-primary" />
                            </motion.div>
                            <p className="font-bold text-foreground mb-0.5 md:mb-1 text-center text-xs md:text-sm">{fileName}</p>
                            <p className="text-xs text-secondary-text">Click to replace file</p>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-3 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                            >
                              File ready to upload
                            </motion.div>
                          </>
                        ) : (
                          <>
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="p-1.5 md:p-3 rounded-full bg-secondary-container/40 mb-2 md:mb-3 group-hover/upload:bg-primary/10 transition-colors"
                            >
                              <Upload className="w-6 h-6 text-secondary-text group-hover/upload:text-primary transition-colors" />
                            </motion.div>
                            <p className="font-bold text-foreground mb-0.5 md:mb-1 text-center text-sm md:text-base">Drop file</p>
                            <p className="text-xs text-secondary-text text-center">or click to browse</p>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </label>

                  <div className="space-y-1.5 md:space-y-2">
                    <p className="text-xs text-secondary-text text-center font-medium">Formats</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {['STL', 'OBJ', 'STEP', 'IGES', 'DWG', 'PDF'].map(format => (
                        <span key={format} className="text-xs bg-surface px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-foreground border border-outline/50">
                          {format}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-secondary-text text-center">Max 10MB • Optional</p>
                  </div>

                  <div className="mt-2 md:mt-3 p-2 md:p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                    <p className="text-xs text-secondary-text text-center leading-relaxed">
                      💡 <strong>Tip:</strong> Describe your design above and we'll help create it.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* submit moved below grid for consistent placement */}

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-3"
            >
              {[
                { title: '⚡ Fast Quotes', desc: 'Response within 24-48 hours' },
                { title: '🎯 Expert Team', desc: 'Design refinement support' },
                { title: '✨ Quality First', desc: 'Precision manufacturing' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
                  className="bg-linear-to-r from-primary/10 to-secondary/10 backdrop-blur rounded-2xl p-3.5 border border-primary/20"
                >
                  <h4 className="font-semibold text-foreground mb-0.5 text-xs">{item.title}</h4>
                  <p className="text-xs text-secondary-text leading-snug">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Full-width Submit Button */}
        <div className="max-w-5xl mx-auto mt-6 px-4">
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <Button type="submit" form="custom-order-form" disabled={loading} className="w-full py-3 md:py-3.5 text-sm font-semibold rounded-xl shadow-lg shadow-primary/10">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Custom Order Request'
              )}
            </Button>
            <p className="text-xs text-secondary-text text-center mt-2">By submitting, you agree to our Terms of Service</p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
