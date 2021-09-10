import { types } from 'mobx-state-tree';

const UserModel = types
  .model({
    address: types.optional(types.string, ''),
  })
  .actions((self) => ({
    setAddress(address: string) {
      self.address = address;
    },
    disconnect() {
      self.address = '';
    },
  }));
export default UserModel;
