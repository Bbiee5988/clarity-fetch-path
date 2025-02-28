;; FetchPath - Enhanced Pet Management System

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u100))
(define-constant err-pet-exists (err u101))
(define-constant err-pet-not-found (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-invalid-verification (err u104))
(define-constant err-invalid-input (err u105))
(define-constant err-future-date (err u106))

;; Data Variables 
(define-map pets 
    { pet-id: uint }
    {
        owner: principal,
        name: (string-ascii 50),
        species: (string-ascii 20),
        birth-date: uint,
        emergency-contact: (optional principal)
    }
)

(define-map vet-records
    { pet-id: uint, record-id: uint }
    {
        date: uint,
        description: (string-ascii 500),
        vet-name: (string-ascii 100),
        vet-license: (string-ascii 20),
        vet-signature: (buff 65),
        verified: bool,
        diagnosis: (string-ascii 100),
        treatment: (string-ascii 200),
        followup-date: uint,
        is-active: bool
    }
)

(define-map authorized-vets
    { vet-principal: principal }
    {
        name: (string-ascii 100),
        license: (string-ascii 20),
        public-key: (buff 33)
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

(define-private (is-authorized-vet (vet principal))
    (is-some (map-get? authorized-vets {vet-principal: vet}))
)

(define-private (validate-date (date uint))
    (< date (+ block-height u525600))  ;; Roughly 1 year in blocks
)

;; Public Functions
(define-public (update-pet-profile 
    (pet-id uint) 
    (name (string-ascii 50)) 
    (emergency-contact (optional principal)))
    (begin
        (asserts! (is-pet-owner pet-id tx-sender) err-unauthorized)
        (asserts! (> (len name) u0) err-invalid-input)
        (ok (map-set pets
            {pet-id: pet-id}
            (merge (unwrap! (map-get? pets {pet-id: pet-id}) err-pet-not-found)
                {
                    name: name,
                    emergency-contact: emergency-contact
                }
            )
        ))
    )
)

(define-public (transfer-pet-ownership (pet-id uint) (new-owner principal))
    (begin
        (asserts! (is-pet-owner pet-id tx-sender) err-unauthorized)
        (ok (map-set pets
            {pet-id: pet-id}
            (merge (unwrap! (map-get? pets {pet-id: pet-id}) err-pet-not-found)
                {owner: new-owner}
            )
        ))
    )
)

;; [Previous functions remain unchanged...]

;; Enhanced Read Only Functions
(define-read-only (get-pet-records (pet-id uint) (start uint) (end uint))
    (begin
        (asserts! (>= end start) err-invalid-input)
        (ok (filter map-get? vet-records
            (map unwrap-panic
                (map (lambda (id) (some {pet-id: pet-id, record-id: id}))
                    (sequence start end)))))
    )
)
