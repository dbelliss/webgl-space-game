class MyLinkedList(object):

    def __init__(self):
        """
        Initialize your data structure here.
        """
        self.head = None
        self.tail = None
        self.length = 0

    def get(self, index):
        """
        Get the value of the index-th node in the linked list. If the index is invalid, return -1.
        :type index: int
        :rtype: int
        """
        if index < 0 or index >= self.length:
            return -1

        node = self.head
        for i in range(0, index):
            node = node.next

        return node.val

    def addAtHead(self, val):
        """
        Add a node of value val before the first element of the linked list. After the insertion, the new node will be the first node of the linked list.
        :type val: int
        :rtype: None
        """
        node = Node(val)

        if self.length == 0:
            self.head = node
            self.tail = node
        else:
            node.next = self.head
            self.head.prev = node
            self.head = node

        self.length += 1

    def addAtTail(self, val):
        """
        Append a node of value val to the last element of the linked list.
        :type val: int
        :rtype: None
        """
        node = Node(val)

        if self.length == 0:
            self.head = node
            self.tail = node
        else:
            self.tail.next = node
            node.prev = self.tail
            self.tail = node

        self.length += 1

    def addAtIndex(self, index, val):
        """
        Add a node of value val before the index-th node in the linked list. If index equals to the length of linked list, the node will be appended to the end of linked list. If index is greater than the length, the node will not be inserted.
        :type index: int
        :type val: int
        :rtype: None
        """
        if index < 0 or index > self.length:
            return -1

        if index == 0:
            self.addAtHead(val)
            return

        if index == self.length:
            self.addAtTail(val)
            return

        prev = self.head
        node = Node(val)
        for i in range(0, index - 1):
            prev = prev.next

        node.next = prev.next
        prev.next.prev = node
        prev.next = node
        node.prev = prev
        self.length += 1

    def deleteAtIndex(self, index):
        """
        Delete the index-th node in the linked list, if the index is valid.
        :type index: int
        :rtype: None
        """
        if index < 0 or index >= self.length:
            return -1

        if index == 0:
            if self.head.next:
                self.head.next.prev = None
            self.head = self.head.next

        elif index == self.length - 1:
            if self.tail.prev:
                self.tail.prev.next = None
            self.tail = self.tail.prev
        else:
            node = self.head
            for i in range(0, index):
                node = node.next
            node.prev.next = node.next
            node.next.prev = node.prev

        self.length -= 1


class Node:
    def __init__(self, val):
        self.next = None
        self.prev = None
        self.val = val


# Your MyLinkedList object will be instantiated and called as such:
# obj = MyLinkedList()
# param_1 = obj.get(index)
# obj.addAtHead(val)
# obj.addAtTail(val)
# obj.addAtIndex(index,val)
# obj.deleteAtIndex(index)
if __name__ == "__main__":
    s = MyLinkedList()
    s.addAtHead(1)
    s.addAtIndex(1,2)
    print(s.get(1))

