// IndexedDB service for offline data storage
// Manages local data storage for PWA functionality
const DB_NAME = 'TelemedicineDB';
const DB_VERSION = 1;

class IndexedDBService {
  constructor() {
    this.db = null;
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create stores
        if (!db.objectStoreNames.contains('healthRecords')) {
          const healthRecordsStore = db.createObjectStore('healthRecords', { keyPath: 'id', autoIncrement: true });
          healthRecordsStore.createIndex('patientId', 'patientId', { unique: false });
          healthRecordsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('appointments')) {
          const appointmentsStore = db.createObjectStore('appointments', { keyPath: 'id', autoIncrement: true });
          appointmentsStore.createIndex('patientId', 'patientId', { unique: false });
          appointmentsStore.createIndex('doctorId', 'doctorId', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // Generic method to add data
  async addData(storeName, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add({ ...data, timestamp: new Date().toISOString() });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get all data from store
  async getAllData(storeName) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to update data
  async updateData(storeName, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to delete data
  async deleteData(storeName, id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Add to sync queue for later upload
  async addToSyncQueue(action, data) {
    return this.addData('syncQueue', {
      action,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    });
  }

  // Get pending sync items
  async getPendingSync() {
    const allSync = await this.getAllData('syncQueue');
    return allSync.filter(item => !item.synced);
  }

  // Mark sync item as completed
  async markSynced(syncId) {
    const allSync = await this.getAllData('syncQueue');
    const item = allSync.find(s => s.id === syncId);
    if (item) {
      item.synced = true;
      await this.updateData('syncQueue', item);
    }
  }

  // Health Records specific methods
  async saveHealthRecord(record) {
    return this.addData('healthRecords', record);
  }

  async getHealthRecords() {
    return this.getAllData('healthRecords');
  }

  // Appointments specific methods
  async saveAppointment(appointment) {
    return this.addData('appointments', appointment);
  }

  async getAppointments() {
    return this.getAllData('appointments');
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();
export default indexedDBService;
