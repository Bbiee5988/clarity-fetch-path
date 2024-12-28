;; FetchPath - Pet Management System

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u100))
(define-constant err-pet-exists (err u101))
(define-constant err-pet-not-found (err u102))
(define-constant err-unauthorized (err u103))

;; Data Variables
(define-map pets 
    { pet-id: uint }
    {
        owner: principal,
        name: (string-ascii 50),
        species: (string-ascii 20),
        birth-date: uint
    }
)

(define-map vet-records
    { pet-id: uint, record-id: uint }
    {
        date: uint,
        description: (string-ascii 500),
        vet-name: (string-ascii 100),
        verified: bool
    }
)

(define-map activities
    { pet-id: uint, activity-id: uint }
    {
        activity-type: (string-ascii 20),
        date: uint,
        duration: uint,
        notes: (string-ascii 200)
    }
)

(define-data-var last-pet-id uint u0)
(define-data-var last-record-id uint u0)
(define-data-var last-activity-id uint u0)

;; Private Functions
(define-private (is-pet-owner (pet-id uint) (user principal))
    (let ((pet-info (unwrap! (map-get? pets {pet-id: pet-id}) false)))
        (is-eq (get owner pet-info) user)
    )
)

;; Public Functions
(define-public (register-pet (name (string-ascii 50)) (species (string-ascii 20)) (birth-date uint))
    (let
        ((new-pet-id (+ (var-get last-pet-id) u1)))
        (var-set last-pet-id new-pet-id)
        (ok (map-insert pets
            {pet-id: new-pet-id}
            {
                owner: tx-sender,
                name: name,
                species: species,
                birth-date: birth-date
            }
        ))
    )
)

(define-public (add-vet-record (pet-id uint) (date uint) (description (string-ascii 500)) (vet-name (string-ascii 100)))
    (let
        ((new-record-id (+ (var-get last-record-id) u1)))
        (asserts! (is-pet-owner pet-id tx-sender) err-unauthorized)
        (var-set last-record-id new-record-id)
        (ok (map-insert vet-records
            {pet-id: pet-id, record-id: new-record-id}
            {
                date: date,
                description: description,
                vet-name: vet-name,
                verified: false
            }
        ))
    )
)

(define-public (log-activity (pet-id uint) (activity-type (string-ascii 20)) (date uint) (duration uint) (notes (string-ascii 200)))
    (let
        ((new-activity-id (+ (var-get last-activity-id) u1)))
        (asserts! (is-pet-owner pet-id tx-sender) err-unauthorized)
        (var-set last-activity-id new-activity-id)
        (ok (map-insert activities
            {pet-id: pet-id, activity-id: new-activity-id}
            {
                activity-type: activity-type,
                date: date,
                duration: duration,
                notes: notes
            }
        ))
    )
)

;; Read Only Functions
(define-read-only (get-pet-info (pet-id uint))
    (ok (map-get? pets {pet-id: pet-id}))
)

(define-read-only (get-vet-record (pet-id uint) (record-id uint))
    (ok (map-get? vet-records {pet-id: pet-id, record-id: record-id}))
)

(define-read-only (get-activity (pet-id uint) (activity-id uint))
    (ok (map-get? activities {pet-id: pet-id, activity-id: activity-id}))
)